import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
  DBSQLiteValues,
} from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { DB_NAME, DB_VERSION, MIGRATIONS } from './migrations';
import { WebDatabaseAdapter } from './web-database.adapter';

type DbBackend = 'native' | 'web';

/**
 * Servicio de acceso a la base de datos local.
 * - En plataforma nativa (iOS/Android): usa SQLite vía @capacitor-community/sqlite.
 * - En web: usa sql.js (SQLite WASM) con persistencia en IndexedDB.
 */
@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private connection: SQLiteDBConnection | null = null;
  private webAdapter: WebDatabaseAdapter | null = null;
  private backend: DbBackend | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.doInit();
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    const isNative = Capacitor.isNativePlatform();
    if (isNative) {
      try {
        const conn = await this.sqlite.createConnection(
          DB_NAME,
          false,
          'no-encryption',
          DB_VERSION,
          false
        );
        await conn.open();
        this.connection = conn;
        this.backend = 'native';
        await this.runMigrationsNative();
      } catch (err) {
        console.error('[DatabaseService] Init (native) failed:', err);
        this.initPromise = null;
        throw err;
      }
    } else {
      this.webAdapter = new WebDatabaseAdapter();
      await this.webAdapter.init();
      this.backend = 'web';
    }
  }

  private async runMigrationsNative(): Promise<void> {
    const conn = this.connection!;
    let currentVersion = 0;

    try {
      const r = await conn.query(
        'SELECT MAX(version) as v FROM schema_version',
        [],
        false
      );
      if (r.values && r.values.length > 0 && r.values[0].v != null) {
        currentVersion = Number(r.values[0].v);
      }
    } catch {
      // Tabla schema_version no existe aún.
    }

    for (let v = currentVersion + 1; v <= DB_VERSION; v++) {
      const sql = MIGRATIONS[v];
      if (!sql) {
        console.warn(`[DatabaseService] No migration for version ${v}`);
        continue;
      }
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'));
      for (const st of statements) {
        if (st) await conn.execute(st + ';', false, false);
      }
    }
  }

  private getConn(): SQLiteDBConnection {
    if (!this.connection) {
      throw new Error(
        'DatabaseService: not initialized. Call init() before using the database.'
      );
    }
    return this.connection;
  }

  async execute(statements: string, transaction = true): Promise<void> {
    if (this.backend === 'web' && this.webAdapter) {
      await this.webAdapter.execute(statements, transaction);
      return;
    }
    const conn = this.getConn();
    await conn.execute(statements, transaction, false);
  }

  async query<T = unknown>(
    statement: string,
    values: unknown[] = []
  ): Promise<T[]> {
    if (this.backend === 'web' && this.webAdapter) {
      return this.webAdapter.query<T>(statement, values as unknown[]);
    }
    const conn = this.getConn();
    const result: DBSQLiteValues = await conn.query(
      statement,
      values.length ? values : undefined,
      false
    );
    if (!result.values || result.values.length === 0) return [];
    return result.values as T[];
  }

  async run(
    statement: string,
    values: unknown[] = [],
    transaction = true
  ): Promise<{ changes: number; lastId?: number }> {
    if (this.backend === 'web' && this.webAdapter) {
      return this.webAdapter.run(statement, values, transaction);
    }
    const conn = this.getConn();
    const ret = await conn.run(
      statement,
      values as any[],
      transaction,
      'all',
      false
    );
    const changes = ret.changes?.changes ?? 0;
    const lastId = ret.changes?.lastId;
    return { changes, lastId };
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
    if (this.webAdapter) {
      await this.webAdapter.close();
      this.webAdapter = null;
    }
    this.backend = null;
    this.initPromise = null;
  }

  isOpen(): boolean {
    if (this.backend === 'web') return this.webAdapter?.isOpen() ?? false;
    return this.connection != null;
  }
}
