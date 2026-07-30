import type { Cop } from '@core/money/money';

/** Un producto en el carrito de compras. */
export interface CartItem {
  id: string;
  /** Nombre opcional del producto. */
  name: string | null;
  /** Precio unitario en COP (enteros). */
  price: Cop;
  /** Cantidad de unidades (≥ 1). */
  quantity: number;
}

/** Calcula el subtotal de un ítem (precio × cantidad). */
export function subtotal(item: CartItem): Cop {
  return item.price * item.quantity;
}
