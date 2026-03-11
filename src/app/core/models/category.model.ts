/**
 * Categoría de movimientos (por defecto o creada por el usuario).
 * nameKey: clave i18n para categorías por defecto (ej. CATEGORIES.FOOD).
 * nameCustom: nombre personalizado cuando el usuario edita o crea una.
 */
export interface Category {
  id: number;
  /** Clave de traducción para categorías por defecto; null si es solo personalizada. */
  nameKey: string | null;
  /** Nombre mostrado: si nameCustom existe se usa, si no se traduce nameKey. */
  nameCustom: string | null;
  isDefault: number; // 1 = por defecto, 0 = creada por usuario
  icon: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: number;
}

export type CategoryCreate = Omit<Category, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
};
