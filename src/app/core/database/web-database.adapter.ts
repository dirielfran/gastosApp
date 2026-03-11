import { DB_VERSION, MIGRATIONS } from './migrations';

const IDB_NAME = 'app_gastos_ccs_idb';
const IDB_STORE = 'sqlite';
const IDB_KEY = 'db';

interface SqlJsDatabase {
  run(sql: string, params?: unknown[]): void;
  exec(sql: string): { columns: string[]; values: unknown[][] }[];
  prepare(sql: string): { bind(values: unknown[]): void; step(): boolean; getAsObject(): Record<string, unknown>; free(): void };
  getRowsModified(): number;
  export(): Uint8Array;
  close(): void;
}

interface SqlJsStatic {
  Database: new (data?: Uint8Array) => SqlJsDatabase;
}

/**
 * Adaptador de base de datos para web usando sql.js (SQLite WASM) con persistencia en IndexedDB.
 * Expone la misma interfaz que el uso de Capacitor SQLite en nativo: init, query, run, execute, isOpen, close.
 */
export class WebDatabaseAdapter {
  private db: SqlJsDatabase | null = null;
  private SQL: SqlJsStatic | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.doInit();
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    const initSqlJs = (await import('sql.js')).default as (config?: { locateFile?: (file: string) => string }) => Promise<SqlJsStatic>;
    this.SQL = await initSqlJs({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/sql.js@1.14.1/dist/${file}`,
    });

    const data = await this.loadFromIndexedDB();
    this.db = data ? new this.SQL.Database(new Uint8Array(data)) : new this.SQL.Database();
    await this.runMigrations();
    await this.persist();
  }

  private openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
    });
  }

  private async loadFromIndexedDB(): Promise<ArrayBuffer | null> {
    const idb = await this.openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_KEY);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result ?? null);
      idb.close();
    });
  }

  private async persist(): Promise<void> {
    if (!this.db) return;
    const data = this.db.export();
    const idb = await this.openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put(data.buffer, IDB_KEY);
      tx.oncomplete = () => {
        idb.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  private getDb(): SqlJsDatabase {
    if (!this.db) {
      throw new Error(
        'WebDatabaseAdapter: not initialized. Call init() before using.'
      );
    }
    return this.db;
  }

  /**
   * Quita líneas de comentario (-- ) y vacías del inicio del SQL; deja el resto para ejecutar.
   */
  private stripLeadingComments(sql: string): string {
    const lines = sql.split(/\r?\n/);
    let i = 0;
    while (i < lines.length) {
      const trimmed = lines[i].trim();
      if (trimmed.length > 0 && !trimmed.startsWith('--')) break;
      i++;
    }
    return lines.slice(i).join('\n').trim();
  }

  private async runMigrations(): Promise<void> {
    const db = this.getDb();
    let currentVersion = 0;

    try {
      const result = db.exec('SELECT MAX(version) as v FROM schema_version');
      if (
        result.length > 0 &&
        result[0].values.length > 0 &&
        result[0].values[0][0] != null
      ) {
        currentVersion = Number(result[0].values[0][0]);
      }
    } catch {
      // Tabla schema_version no existe aún.
    }

    for (let v = currentVersion + 1; v <= DB_VERSION; v++) {
      const sql = MIGRATIONS[v];
      if (!sql) continue;
      const statements = sql
        .split(';')
        .map((s) => this.stripLeadingComments(s.trim()))
        .filter((s) => s.length > 0);
      for (const st of statements) {
        if (st) db.run(st + ';');
      }
    }
    await this.persist();
  }

  async execute(statements: string, _transaction = true): Promise<void> {
    const db = this.getDb();
    const parts = statements
      .split(';')
      .map((s) => this.stripLeadingComments(s.trim()))
      .filter((s) => s.length > 0);
    for (const st of parts) {
      if (st) db.run(st + ';');
    }
    await this.persist();
  }

  async query<T = Record<string, unknown>>(
    statement: string,
    values: unknown[] = []
  ): Promise<T[]> {
    const db = this.getDb();
    if (values.length === 0) {
      const result = db.exec(statement);
      if (!result.length || !result[0].values.length) return [];
      const { columns, values: rows } = result[0];
      return rows.map((row: unknown[]) => {
        const obj: Record<string, unknown> = {};
        columns.forEach((col: string, i: number) => (obj[col] = row[i]));
        return obj as T;
      });
    }
    const stmt = db.prepare(statement);
    stmt.bind(values);
    const rows: T[] = [];
    while (stmt.step()) rows.push(stmt.getAsObject() as T);
    stmt.free();
    return rows;
  }

  async run(
    statement: string,
    values: unknown[] = [],
    _transaction = true
  ): Promise<{ changes: number; lastId?: number }> {
    const db = this.getDb();
    db.run(statement, values);
    const changes = db.getRowsModified();
    let lastId: number | undefined;
    try {
      const r = db.exec('SELECT last_insert_rowid() as id');
      if (r.length > 0 && r[0].values.length > 0) {
        lastId = Number(r[0].values[0][0]);
      }
    } catch {
      // ignore
    }
    await this.persist();
    return { changes, lastId };
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.SQL = null;
    this.initPromise = null;
  }

  isOpen(): boolean {
    return this.db != null;
  }
}
