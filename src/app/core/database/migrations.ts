/**
 * Versión actual del esquema de la base de datos.
 * Incrementar y añadir sentencias en MIGRATIONS al cambiar el esquema.
 */
export const DB_VERSION = 3;

export const DB_NAME = 'app_gastos_ccs';

/**
 * Migraciones por versión.
 * Cada entrada es el SQL a ejecutar para pasar a esa versión (crear tablas o alter).
 */
export const MIGRATIONS: Record<number, string> = {
  1: `
-- Tabla de control de versión del esquema
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER NOT NULL PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Cuentas (efectivo, banco, tarjeta). Una moneda por cuenta.
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  balance REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_active INTEGER NOT NULL DEFAULT 1
);

-- Categorías: por defecto (name_key i18n) o personalizadas (name_custom).
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_key TEXT,
  name_custom TEXT,
  is_default INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  color TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_active INTEGER NOT NULL DEFAULT 1
);

-- Movimientos: gasto o ingreso en una cuenta.
CREATE TABLE IF NOT EXISTS movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  amount REAL NOT NULL CHECK (amount >= 0),
  note TEXT,
  movement_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  photo_uri TEXT,
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX IF NOT EXISTS idx_movements_account ON movements(account_id);
CREATE INDEX IF NOT EXISTS idx_movements_category ON movements(category_id);
CREATE INDEX IF NOT EXISTS idx_movements_date ON movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_movements_type ON movements(type);

-- Presupuestos por categoría (límite mensual y aviso al % configurado).
CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  amount_limit REAL NOT NULL CHECK (amount_limit >= 0),
  period TEXT NOT NULL DEFAULT 'monthly',
  alert_threshold_percent INTEGER NOT NULL DEFAULT 80 CHECK (alert_threshold_percent >= 0 AND alert_threshold_percent <= 100),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Configuración clave-valor (tema, idioma, moneda, avisos de presupuesto).
CREATE TABLE IF NOT EXISTS settings (
  key TEXT NOT NULL PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insertar versión inicial
INSERT OR IGNORE INTO schema_version (version) VALUES (1);
`,
  2: `
-- Seed categorías por defecto (solo si no existen). Claves i18n: es, en, pt.
INSERT INTO categories (name_key, name_custom, is_default, icon, color, created_at, updated_at, is_active)
SELECT 'CATEGORIES.FOOD', NULL, 1, 'restaurant', '#43A047', datetime('now'), datetime('now'), 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_key = 'CATEGORIES.FOOD');
INSERT INTO categories (name_key, name_custom, is_default, icon, color, created_at, updated_at, is_active)
SELECT 'CATEGORIES.TRANSPORT', NULL, 1, 'car', '#1976D2', datetime('now'), datetime('now'), 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_key = 'CATEGORIES.TRANSPORT');
INSERT INTO categories (name_key, name_custom, is_default, icon, color, created_at, updated_at, is_active)
SELECT 'CATEGORIES.LEISURE', NULL, 1, 'happy', '#8E24AA', datetime('now'), datetime('now'), 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_key = 'CATEGORIES.LEISURE');
INSERT INTO categories (name_key, name_custom, is_default, icon, color, created_at, updated_at, is_active)
SELECT 'CATEGORIES.HEALTH', NULL, 1, 'medkit', '#E53935', datetime('now'), datetime('now'), 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_key = 'CATEGORIES.HEALTH');
INSERT INTO categories (name_key, name_custom, is_default, icon, color, created_at, updated_at, is_active)
SELECT 'CATEGORIES.HOME', NULL, 1, 'home', '#FB8C00', datetime('now'), datetime('now'), 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_key = 'CATEGORIES.HOME');
INSERT INTO categories (name_key, name_custom, is_default, icon, color, created_at, updated_at, is_active)
SELECT 'CATEGORIES.SHOPPING', NULL, 1, 'cart', '#00ACC1', datetime('now'), datetime('now'), 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_key = 'CATEGORIES.SHOPPING');
INSERT INTO categories (name_key, name_custom, is_default, icon, color, created_at, updated_at, is_active)
SELECT 'CATEGORIES.SUBSCRIPTIONS', NULL, 1, 'repeat', '#3949AB', datetime('now'), datetime('now'), 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_key = 'CATEGORIES.SUBSCRIPTIONS');
INSERT INTO categories (name_key, name_custom, is_default, icon, color, created_at, updated_at, is_active)
SELECT 'CATEGORIES.OTHER', NULL, 1, 'ellipsis-horizontal', '#92949c', datetime('now'), datetime('now'), 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_key = 'CATEGORIES.OTHER');
INSERT INTO categories (name_key, name_custom, is_default, icon, color, created_at, updated_at, is_active)
SELECT 'CATEGORIES.SALARY', NULL, 1, 'cash', '#43A047', datetime('now'), datetime('now'), 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_key = 'CATEGORIES.SALARY');
INSERT INTO categories (name_key, name_custom, is_default, icon, color, created_at, updated_at, is_active)
SELECT 'CATEGORIES.FREELANCE', NULL, 1, 'laptop', '#1976D2', datetime('now'), datetime('now'), 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_key = 'CATEGORIES.FREELANCE');
INSERT INTO categories (name_key, name_custom, is_default, icon, color, created_at, updated_at, is_active)
SELECT 'CATEGORIES.INVESTMENTS', NULL, 1, 'trending-up', '#00897B', datetime('now'), datetime('now'), 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_key = 'CATEGORIES.INVESTMENTS');
INSERT INTO categories (name_key, name_custom, is_default, icon, color, created_at, updated_at, is_active)
SELECT 'CATEGORIES.GIFTS', NULL, 1, 'gift', '#8E24AA', datetime('now'), datetime('now'), 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_key = 'CATEGORIES.GIFTS');

INSERT OR IGNORE INTO schema_version (version) VALUES (2);
`,
  3: `
-- Movimientos recurrentes (suscripciones, salario, etc.)
CREATE TABLE IF NOT EXISTS recurring_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  amount REAL NOT NULL CHECK (amount >= 0),
  note TEXT,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  day_of_month INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT OR IGNORE INTO schema_version (version) VALUES (3);
`,
};
