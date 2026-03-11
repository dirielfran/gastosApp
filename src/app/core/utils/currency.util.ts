/**
 * Formateo de montos por moneda y idioma.
 * Usa Intl.NumberFormat para respetar locale (es, en, pt) y código de moneda (EUR, USD, COP, BRL, etc.).
 */

const LOCALE_MAP: Record<string, string> = {
  es: 'es-ES',
  en: 'en-US',
  pt: 'pt-BR',
};

/**
 * Formatea un monto como moneda según el código ISO y el idioma de la app.
 * @param amount Monto numérico (puede ser negativo).
 * @param currencyCode Código ISO 4217 (EUR, USD, COP, BRL, GBP, etc.).
 * @param locale Idioma de la app: 'es' | 'en' | 'pt'. Por defecto 'es'.
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  locale: string = 'es'
): string {
  const resolvedLocale = LOCALE_MAP[locale] ?? LOCALE_MAP['es'];
  return new Intl.NumberFormat(resolvedLocale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea un monto sin símbolo de moneda (solo número con separadores de miles y decimales).
 * Útil para inputs o listas donde la moneda se muestra aparte.
 */
export function formatAmount(
  amount: number,
  locale: string = 'es'
): string {
  const resolvedLocale = LOCALE_MAP[locale] ?? LOCALE_MAP['es'];
  return new Intl.NumberFormat(resolvedLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
}
