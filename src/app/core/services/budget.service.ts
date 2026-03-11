import { Injectable } from '@angular/core';
import { DatabaseService } from '../database';
import { mapBudgetRow } from '../database/row-mapper';
import type { Budget, BudgetCreate } from '../models/budget.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  constructor(private db: DatabaseService) {}

  async getAll(activeOnly = true): Promise<Budget[]> {
    const sql = activeOnly
      ? 'SELECT * FROM budgets WHERE is_active = 1 ORDER BY category_id'
      : 'SELECT * FROM budgets ORDER BY category_id';
    const rows = await this.db.query<Record<string, unknown>>(sql, []);
    return rows.map(mapBudgetRow);
  }

  async getById(id: number): Promise<Budget | null> {
    const rows = await this.db.query<Record<string, unknown>>(
      'SELECT * FROM budgets WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? mapBudgetRow(rows[0]) : null;
  }

  async getByCategoryId(categoryId: number): Promise<Budget | null> {
    const rows = await this.db.query<Record<string, unknown>>(
      'SELECT * FROM budgets WHERE category_id = ? AND is_active = 1',
      [categoryId]
    );
    return rows.length > 0 ? mapBudgetRow(rows[0]) : null;
  }

  async create(data: BudgetCreate): Promise<Budget> {
    const now = new Date().toISOString();
    const { lastId } = await this.db.run(
      `INSERT INTO budgets (category_id, amount_limit, period, alert_threshold_percent, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.categoryId,
        data.amountLimit,
        data.period ?? 'monthly',
        data.alertThresholdPercent ?? 80,
        data.isActive ?? 1,
        now,
        now,
      ],
      true
    );
    const created = await this.getById(lastId!);
    if (!created) throw new Error('BudgetService: failed to read after create');
    return created;
  }

  async update(id: number, data: Partial<BudgetCreate>): Promise<void> {
    const now = new Date().toISOString();
    const bud = await this.getById(id);
    if (!bud) return;

    await this.db.run(
      `UPDATE budgets SET amount_limit = ?, period = ?, alert_threshold_percent = ?, is_active = ?, updated_at = ?
       WHERE id = ?`,
      [
        data.amountLimit ?? bud.amountLimit,
        data.period ?? bud.period,
        data.alertThresholdPercent ?? bud.alertThresholdPercent,
        data.isActive ?? bud.isActive,
        now,
        id,
      ],
      true
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.run('DELETE FROM budgets WHERE id = ?', [id], true);
  }

  /** Gasto total en una categoría en un rango de fechas (para comparar con presupuesto). */
  async getSpentInCategory(
    categoryId: number,
    dateFrom: string,
    dateTo: string
  ): Promise<number> {
    const rows = await this.db.query<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM movements
       WHERE category_id = ? AND type = 'expense' AND movement_date >= ? AND movement_date <= ?`,
      [categoryId, dateFrom, dateTo]
    );
    return rows.length > 0 ? Number(rows[0].total) : 0;
  }
}
