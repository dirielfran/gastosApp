import { Injectable } from '@angular/core';
import { DatabaseService } from '../database';
import { mapMovementRow } from '../database/row-mapper';
import type { Movement, MovementCreate, MovementType } from '../models/movement.model';

export interface MovementFilters {
  accountId?: number;
  categoryId?: number;
  type?: MovementType;
  dateFrom?: string;
  dateTo?: string;
  searchText?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MovementService {
  constructor(private db: DatabaseService) {}

  async getAll(filters: MovementFilters = {}): Promise<Movement[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.accountId != null) {
      conditions.push('account_id = ?');
      values.push(filters.accountId);
    }
    if (filters.categoryId != null) {
      conditions.push('category_id = ?');
      values.push(filters.categoryId);
    }
    if (filters.type) {
      conditions.push('type = ?');
      values.push(filters.type);
    }
    if (filters.dateFrom) {
      conditions.push('movement_date >= ?');
      values.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push('movement_date <= ?');
      values.push(filters.dateTo);
    }
    if (filters.searchText) {
      conditions.push('(note LIKE ? OR CAST(amount AS TEXT) LIKE ?)');
      const term = `%${filters.searchText}%`;
      values.push(term, term);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const sql = `SELECT * FROM movements ${where} ORDER BY movement_date DESC, id DESC`;
    const rows = await this.db.query<Record<string, unknown>>(sql, values);
    return rows.map(mapMovementRow);
  }

  async getById(id: number): Promise<Movement | null> {
    const rows = await this.db.query<Record<string, unknown>>(
      'SELECT * FROM movements WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? mapMovementRow(rows[0]) : null;
  }

  async create(data: MovementCreate): Promise<Movement> {
    const now = new Date().toISOString();
    const { lastId } = await this.db.run(
      `INSERT INTO movements (account_id, category_id, type, amount, note, movement_date, created_at, updated_at, photo_uri)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.accountId,
        data.categoryId,
        data.type,
        data.amount,
        data.note ?? null,
        data.movementDate,
        now,
        now,
        data.photoUri ?? null,
      ],
      true
    );
    const created = await this.getById(lastId!);
    if (!created) throw new Error('MovementService: failed to read after create');
    return created;
  }

  async update(id: number, data: Partial<MovementCreate>): Promise<void> {
    const now = new Date().toISOString();
    const mov = await this.getById(id);
    if (!mov) return;

    await this.db.run(
      `UPDATE movements SET account_id = ?, category_id = ?, type = ?, amount = ?, note = ?, movement_date = ?, updated_at = ?, photo_uri = ?
       WHERE id = ?`,
      [
        data.accountId ?? mov.accountId,
        data.categoryId ?? mov.categoryId,
        data.type ?? mov.type,
        data.amount ?? mov.amount,
        data.note !== undefined ? data.note : mov.note,
        data.movementDate ?? mov.movementDate,
        now,
        data.photoUri !== undefined ? data.photoUri : mov.photoUri,
        id,
      ],
      true
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.run('DELETE FROM movements WHERE id = ?', [id], true);
  }

  /** Totales de ingresos y gastos para un rango de fechas (y opcionalmente cuenta). */
  async getTotalsByType(
    dateFrom: string,
    dateTo: string,
    accountId?: number
  ): Promise<{ income: number; expense: number }> {
    const conditions = ['movement_date >= ?', 'movement_date <= ?'];
    const values: unknown[] = [dateFrom, dateTo];
    if (accountId != null) {
      conditions.push('account_id = ?');
      values.push(accountId);
    }
    const where = conditions.join(' AND ');

    const incomeRows = await this.db.query<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM movements WHERE type = 'income' AND ${where}`,
      values
    );
    const expenseRows = await this.db.query<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM movements WHERE type = 'expense' AND ${where}`,
      values
    );

    return {
      income: incomeRows.length > 0 ? Number(incomeRows[0].total) : 0,
      expense: expenseRows.length > 0 ? Number(expenseRows[0].total) : 0,
    };
  }
}
