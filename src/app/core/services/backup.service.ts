import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { DatabaseService } from '../database';

interface BackupData {
  version: number;
  exportedAt: string;
  accounts: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  movements: Record<string, unknown>[];
  budgets: Record<string, unknown>[];
  recurring_movements: Record<string, unknown>[];
  settings: Record<string, unknown>[];
}

@Injectable({
  providedIn: 'root',
})
export class BackupService {
  constructor(private db: DatabaseService) {}

  async exportBackup(): Promise<void> {
    const data: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      accounts: await this.db.query('SELECT * FROM accounts', []),
      categories: await this.db.query('SELECT * FROM categories', []),
      movements: await this.db.query('SELECT * FROM movements', []),
      budgets: await this.db.query('SELECT * FROM budgets', []),
      recurring_movements: await this.db.query('SELECT * FROM recurring_movements', []),
      settings: await this.db.query('SELECT * FROM settings', []),
    };
    const json = JSON.stringify(data, null, 2);
    const filename = `gastos_backup_${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([json], { type: 'application/json' });

    if (Capacitor.isNativePlatform() || this.canShareFiles()) {
      try {
        const file = new File([blob], filename, { type: 'application/json' });
        await navigator.share({ files: [file], title: 'Backup' });
        return;
      } catch {
        // User cancelled share or not supported — fall through to DOM download
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importBackup(file: File): Promise<void> {
    const text = await file.text();
    let data: BackupData;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('BACKUP_INVALID');
    }
    this.validateBackupData(data);

    await this.db.run('DELETE FROM movements', [], true);
    await this.db.run('DELETE FROM budgets', [], true);
    await this.db.run('DELETE FROM recurring_movements', [], true);
    await this.db.run('DELETE FROM categories WHERE is_default = 0', [], true);
    await this.db.run('DELETE FROM accounts', [], true);

    for (const a of data.accounts) {
      await this.db.run(
        `INSERT OR REPLACE INTO accounts (id, name, currency_code, balance, icon, color, created_at, updated_at, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [a['id'], a['name'], a['currency_code'], a['balance'] ?? 0, a['icon'] ?? null, a['color'] ?? null, a['created_at'], a['updated_at'], a['is_active'] ?? 1],
        true
      );
    }
    for (const c of data.categories) {
      await this.db.run(
        `INSERT OR REPLACE INTO categories (id, name_key, name_custom, is_default, icon, color, created_at, updated_at, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c['id'], c['name_key'], c['name_custom'], c['is_default'] ?? 0, c['icon'], c['color'], c['created_at'], c['updated_at'], c['is_active'] ?? 1],
        true
      );
    }
    for (const m of data.movements) {
      await this.db.run(
        `INSERT OR REPLACE INTO movements (id, account_id, category_id, type, amount, note, movement_date, created_at, updated_at, photo_uri)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [m['id'], m['account_id'], m['category_id'], m['type'], m['amount'], m['note'], m['movement_date'], m['created_at'], m['updated_at'], m['photo_uri']],
        true
      );
    }
    for (const b of data.budgets) {
      await this.db.run(
        `INSERT OR REPLACE INTO budgets (id, category_id, amount_limit, period, alert_threshold_percent, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [b['id'], b['category_id'], b['amount_limit'], b['period'], b['alert_threshold_percent'], b['is_active'] ?? 1, b['created_at'], b['updated_at']],
        true
      );
    }
    if (data.recurring_movements) {
      for (const r of data.recurring_movements) {
        await this.db.run(
          `INSERT OR REPLACE INTO recurring_movements (id, account_id, category_id, type, amount, note, frequency, day_of_month, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [r['id'], r['account_id'], r['category_id'], r['type'], r['amount'], r['note'], r['frequency'], r['day_of_month'], r['is_active'] ?? 1, r['created_at'], r['updated_at']],
          true
        );
      }
    }
    if (data.settings) {
      for (const s of data.settings) {
        await this.db.run(
          `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
          [s['key'], s['value'], s['updated_at']],
          true
        );
      }
    }
  }

  private validateBackupData(data: unknown): asserts data is BackupData {
    if (!data || typeof data !== 'object') throw new Error('BACKUP_INVALID');
    const d = data as Record<string, unknown>;
    if (typeof d['version'] !== 'number') throw new Error('BACKUP_INVALID');
    if (!Array.isArray(d['accounts'])) throw new Error('BACKUP_INVALID');
    if (!Array.isArray(d['movements'])) throw new Error('BACKUP_INVALID');
    if (!Array.isArray(d['categories'])) throw new Error('BACKUP_INVALID');
    for (const a of d['accounts'] as Record<string, unknown>[]) {
      if (a['id'] == null || !a['name'] || !a['currency_code']) throw new Error('BACKUP_INVALID');
    }
    for (const m of d['movements'] as Record<string, unknown>[]) {
      if (m['id'] == null || m['account_id'] == null || m['type'] == null || m['amount'] == null) throw new Error('BACKUP_INVALID');
    }
  }

  private canShareFiles(): boolean {
    try {
      return typeof navigator.share === 'function' && typeof navigator.canShare === 'function';
    } catch {
      return false;
    }
  }
}
