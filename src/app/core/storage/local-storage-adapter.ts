import { StoragePort } from './storage-port';

/** Adaptador concreto que usa la API `localStorage` del navegador. */
export class LocalStorageAdapter<T> implements StoragePort<T> {
  load(key: string): T | null {
    if (typeof localStorage === 'undefined') return null;

    const raw = localStorage.getItem(key);
    if (raw === null) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  save(key: string, data: T): void {
    if (typeof localStorage === 'undefined') return;

    localStorage.setItem(key, JSON.stringify(data));
  }

  clear(key: string): void {
    if (typeof localStorage === 'undefined') return;

    localStorage.removeItem(key);
  }
}
