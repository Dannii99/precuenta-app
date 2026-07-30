import { TestBed } from '@angular/core/testing';
import { CartStoreService } from './cart-store';
import type { CartItem } from './cart-item';

const STORAGE_KEY = '__cart_v1';

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: overrides.id ?? 'test-id',
    name: overrides.name ?? null,
    price: overrides.price ?? 1000,
    quantity: overrides.quantity ?? 1,
  };
}

describe('CartStoreService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('arranca vacío', () => {
    const store = TestBed.inject(CartStoreService);
    expect(store.state().items).toEqual([]);
    expect(store.total()).toBe(0);
    expect(store.itemCount()).toBe(0);
  });

  it('addItem agrega ítem y actualiza total', () => {
    const store = TestBed.inject(CartStoreService);
    const item = makeItem({ price: 5000, quantity: 2 });
    store.addItem(item);
    expect(store.state().items).toHaveLength(1);
    expect(store.total()).toBe(10000);
    expect(store.itemCount()).toBe(1);
  });

  it('updateItem modifica precio y cantidad', () => {
    const store = TestBed.inject(CartStoreService);
    const item = makeItem({ id: 'a', price: 2000, quantity: 1 });
    store.addItem(item);
    store.updateItem('a', { price: 3000, quantity: 3 });
    const updated = store.state().items[0];
    expect(updated.price).toBe(3000);
    expect(updated.quantity).toBe(3);
    expect(store.total()).toBe(9000);
  });

  it('updateItem no afecta otros ítems', () => {
    const store = TestBed.inject(CartStoreService);
    store.addItem(makeItem({ id: 'a', price: 1000 }));
    store.addItem(makeItem({ id: 'b', price: 2000 }));
    store.updateItem('a', { price: 5000 });
    expect(store.state().items).toHaveLength(2);
    expect(store.total()).toBe(7000);
  });

  it('removeItem elimina ítem y actualiza total', () => {
    const store = TestBed.inject(CartStoreService);
    store.addItem(makeItem({ id: 'a', price: 1000 }));
    store.addItem(makeItem({ id: 'b', price: 2000 }));
    store.removeItem('a');
    expect(store.state().items).toHaveLength(1);
    expect(store.state().items[0].id).toBe('b');
    expect(store.total()).toBe(2000);
  });

  it('removeItem del último ítem → estado vacío', () => {
    const store = TestBed.inject(CartStoreService);
    store.addItem(makeItem({ id: 'unico', price: 1500 }));
    store.removeItem('unico');
    expect(store.state().items).toEqual([]);
    expect(store.total()).toBe(0);
    expect(store.itemCount()).toBe(0);
  });

  describe('persistencia', () => {
    it('persiste y restaura ítems tras recrear el servicio', () => {
      const store = TestBed.inject(CartStoreService);
      store.addItem(makeItem({ id: 'p1', price: 50000, quantity: 2 }));
      store.addItem(makeItem({ id: 'p2', price: 2000 }));
      expect(store.itemCount()).toBe(2);

      // Simular cierre/reapertura: nuevo TestBed (limpia inyectables)
      localStorage.removeItem('no-relacionado');

      const store2 = TestBed.inject(CartStoreService);
      expect(store2.itemCount()).toBe(2);
      expect(store2.total()).toBe(50000 * 2 + 2000);
    });

    it('carga vacío si no hay datos persistidos', () => {
      const store = TestBed.inject(CartStoreService);
      expect(store.state().items).toEqual([]);
    });

    it('carga vacío si payload está corrupto', () => {
      localStorage.setItem(STORAGE_KEY, 'not-json');
      const store = TestBed.inject(CartStoreService);
      expect(store.state().items).toEqual([]);
    });

    it('carga vacío si schema tiene versión desconocida', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ v: 999, items: [], budget: null }),
      );
      const store = TestBed.inject(CartStoreService);
      expect(store.state().items).toEqual([]);
    });

    it('carga vacío si items no es array', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ v: 1, items: 'not-an-array', budget: null }),
      );
      const store = TestBed.inject(CartStoreService);
      expect(store.state().items).toEqual([]);
    });

    it('persiste write-through en cada mutación', () => {
      const store = TestBed.inject(CartStoreService);
      store.addItem(makeItem({ id: 'wt', price: 9999 }));
      TestBed.flushEffects();
      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.items).toHaveLength(1);
      expect(parsed.items[0].price).toBe(9999);
    });
  });
});
