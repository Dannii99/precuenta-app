import {
  Injectable,
  computed,
  effect,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import type { Cop } from '@core/money/money';
import type { CartItem } from './cart-item';
import { subtotal } from './cart-item';

/** Versión del schema persistido. */
const SCHEMA_VERSION = 1 as const;

/** Forma del payload en localStorage. */
interface PersistedCart {
  v: typeof SCHEMA_VERSION;
  items: CartItem[];
  budget: null; // reservado para el change budget
}

const STORAGE_KEY = '__cart_v1';

export interface CartState {
  items: CartItem[];
  budget: null;
}

export interface CartStore {
  /** Señal de solo lectura con el estado completo. */
  readonly state: Signal<CartState>;
  /** Total del carrito en COP. */
  readonly total: Signal<Cop>;
  /** Cantidad total de ítems. */
  readonly itemCount: Signal<number>;

  addItem(item: CartItem): void;
  updateItem(id: string, changes: Partial<Pick<CartItem, 'name' | 'price' | 'quantity'>>): void;
  removeItem(id: string): void;
}

/**
 * Valida que un objeto desconocido cumpla con la estructura PersistedCart v1.
 * Devuelve el objeto tipado si es válido, o null si no.
 */
function validateSchema(raw: unknown): PersistedCart | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const p = raw as Record<string, unknown>;
  if (p['v'] !== SCHEMA_VERSION) return null;
  if (!Array.isArray(p['items'])) return null;
  const validItems = p['items'].every(
    (i: unknown) =>
      typeof i === 'object' &&
      i !== null &&
      typeof (i as Record<string, unknown>)['id'] === 'string' &&
      typeof (i as Record<string, unknown>)['price'] === 'number' &&
      typeof (i as Record<string, unknown>)['quantity'] === 'number',
  );
  if (!validItems) return null;
  return p as unknown as PersistedCart;
}

@Injectable({
  providedIn: 'root',
})
export class CartStoreService implements CartStore {
  private readonly _state: WritableSignal<CartState>;
  readonly state: Signal<CartState>;
  readonly total: Signal<Cop>;
  readonly itemCount: Signal<number>;

  constructor() {
    const initial = loadFromStorage();
    this._state = signal<CartState>(initial);
    this.state = this._state.asReadonly();
    this.total = computed(() =>
      this._state().items.reduce((acc, item) => acc + subtotal(item), 0),
    );
    this.itemCount = computed(() => this._state().items.length);

    // write-through en cada cambio del estado
    effect(() => {
      persistToStorage(this._state());
    });
  }

  addItem(item: CartItem): void {
    this._state.update((s) => ({ ...s, items: [...s.items, item] }));
  }

  updateItem(
    id: string,
    changes: Partial<Pick<CartItem, 'name' | 'price' | 'quantity'>>,
  ): void {
    this._state.update((s) => ({
      ...s,
      items: s.items.map((item) =>
        item.id === id ? { ...item, ...changes } : item,
      ),
    }));
  }

  removeItem(id: string): void {
    this._state.update((s) => ({
      ...s,
      items: s.items.filter((item) => item.id !== id),
    }));
  }
}

// ---------- Persistencia (módulo privado) ----------

function loadFromStorage(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    const valid = validateSchema(parsed);
    if (!valid) return emptyState();
    return { items: valid.items, budget: valid.budget ?? null };
  } catch {
    return emptyState();
  }
}

function persistToStorage(state: CartState): void {
  try {
    const payload: PersistedCart = {
      v: SCHEMA_VERSION,
      items: state.items,
      budget: state.budget,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage lleno o no disponible — silencio
  }
}

function emptyState(): CartState {
  return { items: [], budget: null };
}
