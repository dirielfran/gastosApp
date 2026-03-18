import { Injectable } from '@angular/core';
import { DatabaseService } from '../database';
import { mapAccountRow } from '../database/row-mapper';
import type { Account, AccountCreate } from '../models/account.model';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private db: DatabaseService) {}

  async getAll(activeOnly = true): Promise<Account[]> {
    const sql = activeOnly
      ? 'SELECT * FROM accounts WHERE is_active = 1 ORDER BY name'
      : 'SELECT * FROM accounts ORDER BY name';
    const rows = await this.db.query<Record<string, unknown>>(sql, []);
    return rows.map(mapAccountRow);
  }

  async getById(id: number): Promise<Account | null> {
    const rows = await this.db.query<Record<string, unknown>>(
      'SELECT * FROM accounts WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? mapAccountRow(rows[0]) : null;
  }

  async create(data: AccountCreate): Promise<Account> {
    const now = new Date().toISOString();
    const { lastId } = await this.db.run(
      `INSERT INTO accounts (name, currency_code, balance, icon, color, created_at, updated_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.currencyCode,
        data.balance ?? 0,
        data.icon ?? 'wallet-outline',
        data.color ?? '#1976D2',
        now,
        now,
        data.isActive ?? 1,
      ],
      true
    );
    const created = await this.getById(lastId!);
    if (!created) throw new Error('AccountService: failed to read after create');
    return created;
  }

  async update(id: number, data: Partial<AccountCreate>): Promise<void> {
    const now = new Date().toISOString();
    const acc = await this.getById(id);
    if (!acc) return;

    await this.db.run(
      `UPDATE accounts SET name = ?, currency_code = ?, balance = ?, icon = ?, color = ?, updated_at = ?, is_active = ?
       WHERE id = ?`,
      [
        data.name ?? acc.name,
        data.currencyCode ?? acc.currencyCode,
        data.balance ?? acc.balance ?? 0,
        data.icon ?? acc.icon ?? 'wallet-outline',
        data.color ?? acc.color ?? '#1976D2',
        now,
        data.isActive ?? acc.isActive,
        id,
      ],
      true
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.run('DELETE FROM accounts WHERE id = ?', [id], true);
  }

  /** Marca la cuenta como inactiva en lugar de borrarla. */
  async deactivate(id: number): Promise<void> {
    await this.update(id, { isActive: 0 });
  }

  /** Recalcula el balance de TODAS las cuentas en una sola query + updates. */
  async recalculateAllBalances(): Promise<void> {
    const rows = await this.db.query<{ account_id: number; total: number }>(
      `SELECT account_id, COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as total
       FROM movements GROUP BY account_id`,
      []
    );
    const balanceMap = new Map(rows.map((r) => [Number(r.account_id), Number(r.total)]));
    const accounts = await this.getAll(false);
    const now = new Date().toISOString();
    for (const acc of accounts) {
      const bal = balanceMap.get(acc.id) ?? 0;
      await this.db.run(
        'UPDATE accounts SET balance = ?, updated_at = ? WHERE id = ?',
        [bal, now, acc.id],
        true
      );
    }
  }

  /** Recalcula y actualiza el balance de una cuenta desde movimientos. */
  async recalculateBalance(accountId: number): Promise<number> {
    const rows = await this.db.query<{ total: number }>(
      `SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as total
       FROM movements WHERE account_id = ?`,
      [accountId]
    );
    const total = rows.length > 0 ? Number(rows[0].total) : 0;
    await this.db.run(
      'UPDATE accounts SET balance = ?, updated_at = ? WHERE id = ?',
      [total, new Date().toISOString(), accountId],
      true
    );
    return total;
  }
}
