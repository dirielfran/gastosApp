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
  icon: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: number;
}

export type AccountCreate = Omit<Account, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
};
