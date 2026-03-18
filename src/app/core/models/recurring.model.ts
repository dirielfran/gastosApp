export type RecurringFrequency = 'monthly' | 'weekly';

export interface RecurringMovement {
  id: number;
  accountId: number;
  categoryId: number;
  type: 'expense' | 'income';
  amount: number;
  note: string | null;
  frequency: RecurringFrequency;
  dayOfMonth: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export type RecurringMovementCreate = Omit<RecurringMovement, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
};
