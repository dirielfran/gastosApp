import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DatabaseService } from '../database';
import { mapRecurringMovementRow } from '../database/row-mapper';
import { MovementService } from './movement.service';
import type { RecurringMovement, RecurringMovementCreate } from '../models/recurring.model';

@Injectable({
  providedIn: 'root',
})
export class RecurringService {
  constructor(
    private db: DatabaseService,
    private movementService: MovementService,
    private translate: TranslateService
  ) {}

  async getAll(activeOnly = true): Promise<RecurringMovement[]> {
    const sql = activeOnly
      ? 'SELECT * FROM recurring_movements WHERE is_active = 1 ORDER BY day_of_month'
      : 'SELECT * FROM recurring_movements ORDER BY day_of_month';
    const rows = await this.db.query<Record<string, unknown>>(sql, []);
    return rows.map(mapRecurringMovementRow);
  }

  async getById(id: number): Promise<RecurringMovement | null> {
    const rows = await this.db.query<Record<string, unknown>>(
      'SELECT * FROM recurring_movements WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? mapRecurringMovementRow(rows[0]) : null;
  }

  async create(data: RecurringMovementCreate): Promise<RecurringMovement> {
    const now = new Date().toISOString();
    const { lastId } = await this.db.run(
      `INSERT INTO recurring_movements (account_id, category_id, type, amount, note, frequency, day_of_month, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.accountId,
        data.categoryId,
        data.type,
        data.amount,
        data.note ?? null,
        data.frequency ?? 'monthly',
        data.dayOfMonth ?? 1,
        data.isActive ?? 1,
        now,
        now,
      ],
      true
    );
    const created = await this.getById(lastId!);
    if (!created) throw new Error('RecurringService: failed to read after create');
    return created;
  }

  async update(id: number, data: Partial<RecurringMovementCreate>): Promise<void> {
    const now = new Date().toISOString();
    const rec = await this.getById(id);
    if (!rec) return;

    await this.db.run(
      `UPDATE recurring_movements SET account_id = ?, category_id = ?, type = ?, amount = ?, note = ?, frequency = ?, day_of_month = ?, is_active = ?, updated_at = ?
       WHERE id = ?`,
      [
        data.accountId ?? rec.accountId,
        data.categoryId ?? rec.categoryId,
        data.type ?? rec.type,
        data.amount ?? rec.amount,
        data.note !== undefined ? data.note : rec.note,
        data.frequency ?? rec.frequency,
        data.dayOfMonth ?? rec.dayOfMonth,
        data.isActive ?? rec.isActive,
        now,
        id,
      ],
      true
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.run('DELETE FROM recurring_movements WHERE id = ?', [id], true);
  }

  /**
   * Genera movimientos reales para el mes actual a partir de los recurrentes activos.
   * Se llama desde AppComponent al inicio de la app.
   */
  async applyRecurringForCurrentMonth(): Promise<number> {
    const recs = await this.getAll(true);
    if (recs.length === 0) return 0;

    const now = new Date();
    const y = now.getFullYear();
    const monthIdx = now.getMonth();
    const m = String(monthIdx + 1).padStart(2, '0');
    const tag = this.translate.instant('RECURRING.TAG');
    let count = 0;

    for (const rec of recs) {
      const dates = this.getRecurringDatesForMonth(rec.frequency, rec.dayOfMonth, y, monthIdx);

      for (const movDate of dates) {
        const existing = await this.db.query<{ cnt: number }>(
          `SELECT COUNT(*) as cnt FROM movements
           WHERE account_id = ? AND category_id = ? AND type = ? AND amount = ? AND movement_date = ?
           AND note LIKE ?`,
          [rec.accountId, rec.categoryId, rec.type, rec.amount, movDate, `[${tag}]%`]
        );
        if (existing.length > 0 && Number(existing[0].cnt) > 0) continue;

        await this.movementService.create({
          accountId: rec.accountId,
          categoryId: rec.categoryId,
          type: rec.type,
          amount: rec.amount,
          note: `[${tag}] ${rec.note ?? ''}`.trim(),
          movementDate: movDate,
          photoUri: null,
        });
        count++;
      }
    }
    return count;
  }

  private getRecurringDatesForMonth(
    frequency: 'monthly' | 'weekly',
    dayOfMonth: number,
    year: number,
    monthIdx: number
  ): string[] {
    const m = String(monthIdx + 1).padStart(2, '0');
    const lastDayOfMonth = new Date(year, monthIdx + 1, 0).getDate();

    if (frequency === 'monthly') {
      const day = String(Math.min(dayOfMonth, lastDayOfMonth)).padStart(2, '0');
      return [`${year}-${m}-${day}`];
    }

    // Weekly: dayOfMonth represents day of week (1=Mon ... 7=Sun)
    const targetDow = ((dayOfMonth - 1) % 7);
    const dates: string[] = [];
    for (let d = 1; d <= lastDayOfMonth; d++) {
      const date = new Date(year, monthIdx, d);
      if (date.getDay() === targetDow) {
        dates.push(`${year}-${m}-${String(d).padStart(2, '0')}`);
      }
    }
    return dates;
  }
}
