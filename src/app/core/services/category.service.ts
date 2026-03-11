import { Injectable } from '@angular/core';
import { DatabaseService } from '../database';
import { mapCategoryRow } from '../database/row-mapper';
import type { Category, CategoryCreate } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private db: DatabaseService) {}

  async getAll(activeOnly = true): Promise<Category[]> {
    const sql = activeOnly
      ? 'SELECT * FROM categories WHERE is_active = 1 ORDER BY is_default DESC, name_key, name_custom'
      : 'SELECT * FROM categories ORDER BY is_default DESC, name_key, name_custom';
    const rows = await this.db.query<Record<string, unknown>>(sql, []);
    return rows.map(mapCategoryRow);
  }

  async getById(id: number): Promise<Category | null> {
    const rows = await this.db.query<Record<string, unknown>>(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? mapCategoryRow(rows[0]) : null;
  }

  async getDefaultCategories(activeOnly = true): Promise<Category[]> {
    const sql = activeOnly
      ? 'SELECT * FROM categories WHERE is_default = 1 AND is_active = 1 ORDER BY name_key'
      : 'SELECT * FROM categories WHERE is_default = 1 ORDER BY name_key';
    const rows = await this.db.query<Record<string, unknown>>(sql, []);
    return rows.map(mapCategoryRow);
  }

  async create(data: CategoryCreate): Promise<Category> {
    const now = new Date().toISOString();
    const { lastId } = await this.db.run(
      `INSERT INTO categories (name_key, name_custom, is_default, icon, color, created_at, updated_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.nameKey ?? null,
        data.nameCustom ?? null,
        data.isDefault ?? 0,
        data.icon ?? null,
        data.color ?? null,
        now,
        now,
        data.isActive ?? 1,
      ],
      true
    );
    const created = await this.getById(lastId!);
    if (!created) throw new Error('CategoryService: failed to read after create');
    return created;
  }

  async update(id: number, data: Partial<CategoryCreate>): Promise<void> {
    const now = new Date().toISOString();
    const cat = await this.getById(id);
    if (!cat) return;

    await this.db.run(
      `UPDATE categories SET name_key = ?, name_custom = ?, icon = ?, color = ?, updated_at = ?, is_active = ?
       WHERE id = ?`,
      [
        data.nameKey ?? cat.nameKey,
        data.nameCustom ?? cat.nameCustom,
        data.icon ?? cat.icon,
        data.color ?? cat.color,
        now,
        data.isActive ?? cat.isActive,
        id,
      ],
      true
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.run('DELETE FROM categories WHERE id = ?', [id], true);
  }

  /** Marca la categoría como inactiva. No borra si hay movimientos (opcional: comprobar antes). */
  async deactivate(id: number): Promise<void> {
    await this.update(id, { isActive: 0 });
  }

  async countMovementsByCategoryId(categoryId: number): Promise<number> {
    const rows = await this.db.query<{ count: number }>(
      'SELECT COUNT(*) as count FROM movements WHERE category_id = ?',
      [categoryId]
    );
    return rows.length > 0 ? Number(rows[0].count) : 0;
  }
}
