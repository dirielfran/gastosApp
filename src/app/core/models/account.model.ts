/**
 * Cuenta (ej. efectivo, banco, tarjeta).
 * Cada cuenta tiene una moneda asociada.
 */
export interface Account {
  id: number;
  name: string;
  currencyCode: string;
  /** Balance cacheado opcional (se puede recalcular desde movimientos). */
  balance?: number;
  createdAt: string;
  updatedAt: string;
  isActive: number; // 1 = activa, 0 = inactiva
}

export type AccountCreate = Omit<Account, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
};
