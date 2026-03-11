/**
 * Configuración clave-valor (tema, idioma, moneda por defecto, etc.).
 */
export interface AppSettings {
  key: string;
  value: string;
  updatedAt: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export const SETTINGS_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  DEFAULT_CURRENCY: 'default_currency',
  BUDGET_ALERTS_ENABLED: 'budget_alerts_enabled',
} as const;
