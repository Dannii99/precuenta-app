/** Entero positivo que representa una cantidad en pesos colombianos (COP). */
export type Cop = number;

/**
 * Parsea un string extrayendo solo los dígitos para obtener un valor Cop.
 * Ejemplo: `parseCop('$ 12.900')` → `12900`.
 */
export function parseCop(value: string): Cop {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return 0;
  return Number.parseInt(digits, 10);
}

/**
 * Formatea un valor Cop al locale es-CO con moneda COP, sin decimales.
 * Ejemplo: `formatCop(12900)` → `'$ 12.900'`.
 */
export function formatCop(amount: Cop): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Suma uno o más valores Cop usando aritmética de enteros. */
export function sumCop(...amounts: Cop[]): Cop {
  return amounts.reduce((acc, v) => acc + v, 0);
}

/** Multiplica un precio Cop por una cantidad (subtotal = precio × cantidad). */
export function multiplyCop(price: Cop, qty: number): Cop {
  return price * Math.floor(qty);
}
