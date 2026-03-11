/**
 * Movimiento: gasto o ingreso en una cuenta.
 */
export type MovementType = 'expense' | 'income';

export interface Movement {
  id: number;
  accountId: number;
  categoryId: number;
  type: MovementType;
  amount: number; // siempre positivo; el tipo indica si es gasto o ingreso
  note: string | null;
  movementDate: string; // ISO date YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  /** Opcional: ruta a foto del ticket (Fase 7). */
  photoUri: string | null;
}

export type MovementCreate = Omit<Movement, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
};
