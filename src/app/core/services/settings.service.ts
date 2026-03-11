import { Injectable } from '@angular/core';
import { DatabaseService } from '../database';
import { SETTINGS_KEYS } from '../models/settings.model';

const STORAGE_PREFIX = 'app_gastos_setting_';

/**
 * Servicio de configuración de la app.
 * Lee y escribe en la tabla settings de SQLite; en web (sin BD) usa localStorage.
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private memoryCache: Map<string, string> = new Map();

  constructor(private database: DatabaseService) {}

  /**
   * Obtiene el valor de una clave. Si no existe, devuelve defaultValue.
   */
  async getSetting(key: string, defaultValue: string = ''): Promise<string> {
    const cached = this.memoryCache.get(key);
    if (cached !== undefined) return cached;

    if (!this.database.isOpen()) {
      const local = localStorage.getItem(STORAGE_PREFIX + key);
      const val = local ?? defaultValue;
      if (val) this.memoryCache.set(key, val);
      return val;
    }

    try {
      const rows = await this.database.query<{ value: string }>(
        'SELECT value FROM settings WHERE key = ?',
        [key]
      );
      const val = rows.length > 0 ? rows[0].value : defaultValue;
      if (val) this.memoryCache.set(key, val);
      return val;
    } catch {
      const local = localStorage.getItem(STORAGE_PREFIX + key);
      const val = local ?? defaultValue;
      if (val) this.memoryCache.set(key, val);
      return val;
    }
  }

  /**
   * Guarda un valor para la clave. Persiste en BD (o localStorage en web) y en caché.
   */
  async setSetting(key: string, value: string): Promise<void> {
    this.memoryCache.set(key, value);
    const now = new Date().toISOString();

    if (!this.database.isOpen()) {
      localStorage.setItem(STORAGE_PREFIX + key, value);
      return;
    }

    try {
      await this.database.run(
        `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
        [key, value, now],
        true
      );
    } catch {
      localStorage.setItem(STORAGE_PREFIX + key, value);
    }
  }

  /** Claves estándar para uso en la app. */
  get keys(): typeof SETTINGS_KEYS {
    return SETTINGS_KEYS;
  }
}
