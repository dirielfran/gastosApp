/**
 * Mapeo de filas de la BD (snake_case) a modelos (camelCase).
 * SQLite y sql.js devuelven los nombres de columna tal como en el esquema.
 * Se usa acceso por corchetes para cumplir con index signature (TS4111).
 */
export function mapAccountRow(r: Record<string, unknown>): {
  id: number;
  name: string;
  currencyCode: string;
  balance?: number;
  createdAt: string;
  updatedAt: string;
  isActive: number;
} {
  return {
    id: Number(r['id']),
    name: String(r['name']),
    currencyCode: String(r['currency_code']),
    balance: r['balance'] != null ? Number(r['balance']) : undefined,
    createdAt: String(r['created_at']),
    updatedAt: String(r['updated_at']),
    isActive: Number(r['is_active']),
  };
}

export function mapCategoryRow(r: Record<string, unknown>): {
  id: number;
  nameKey: string | null;
  nameCustom: string | null;
  isDefault: number;
  icon: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: number;
} {
  return {
    id: Number(r['id']),
    nameKey: r['name_key'] != null ? String(r['name_key']) : null,
    nameCustom: r['name_custom'] != null ? String(r['name_custom']) : null,
    isDefault: Number(r['is_default']),
    icon: r['icon'] != null ? String(r['icon']) : null,
    color: r['color'] != null ? String(r['color']) : null,
    createdAt: String(r['created_at']),
    updatedAt: String(r['updated_at']),
    isActive: Number(r['is_active']),
  };
}

export function mapMovementRow(r: Record<string, unknown>): {
  id: number;
  accountId: number;
  categoryId: number;
  type: 'expense' | 'income';
  amount: number;
  note: string | null;
  movementDate: string;
  createdAt: string;
  updatedAt: string;
  photoUri: string | null;
} {
  return {
    id: Number(r['id']),
    accountId: Number(r['account_id']),
    categoryId: Number(r['category_id']),
    type: r['type'] === 'income' ? 'income' : 'expense',
    amount: Number(r['amount']),
    note: r['note'] != null ? String(r['note']) : null,
    movementDate: String(r['movement_date']),
    createdAt: String(r['created_at']),
    updatedAt: String(r['updated_at']),
    photoUri: r['photo_uri'] != null ? String(r['photo_uri']) : null,
  };
}

export function mapBudgetRow(r: Record<string, unknown>): {
  id: number;
  categoryId: number;
  amountLimit: number;
  period: 'monthly';
  alertThresholdPercent: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: Number(r['id']),
    categoryId: Number(r['category_id']),
    amountLimit: Number(r['amount_limit']),
    period: (r['period'] === 'monthly' ? 'monthly' : 'monthly') as 'monthly',
    alertThresholdPercent: Number(r['alert_threshold_percent']),
    isActive: Number(r['is_active']),
    createdAt: String(r['created_at']),
    updatedAt: String(r['updated_at']),
  };
}
