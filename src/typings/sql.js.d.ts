declare module 'sql.js' {
  export interface SqlJsStatic {
    Database: new (data?: Uint8Array) => SqlJsDatabase;
  }

  export interface SqlJsDatabase {
    run(sql: string, params?: unknown[]): void;
    exec(sql: string): ExecResult[];
    prepare(sql: string): SqlJsStatement;
    getRowsModified(): number;
    export(): Uint8Array;
    close(): void;
  }

  export interface SqlJsStatement {
    bind(values: unknown[]): void;
    step(): boolean;
    getAsObject(): Record<string, unknown>;
    free(): void;
  }

  export interface ExecResult {
    columns: string[];
    values: unknown[][];
  }

  export default function initSqlJs(config?: { locateFile?: (file: string) => string }): Promise<SqlJsStatic>;
}
