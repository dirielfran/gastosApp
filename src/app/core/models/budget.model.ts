/**
 * Presupuesto por categoría (ej. máximo 500 € en comida al mes).
 * Configurable en el módulo de configuración; aviso al acercarse al límite.
 */
export type BudgetPeriod = 'monthly';

export interface Budget {
  id: number;
  categoryId: number;
  amountLimit: number;
  period: BudgetPeriod;
  /** Porcentaje (0-100) al que se dispara el aviso. Ej: 80. */
  alertThresholdPercent: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export type BudgetCreate = Omit<Budget, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
};
