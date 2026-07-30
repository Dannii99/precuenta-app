import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageAdapter } from './local-storage-adapter';
import type { StoragePort } from './storage-port';

describe('LocalStorageAdapter', () => {
  let adapter: StoragePort<{ name: string }>;

  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalStorageAdapter<{ name: string }>();
  });

  it('saves and loads data round-trip', () => {
    adapter.save('test-key', { name: 'test-value' });
    expect(adapter.load('test-key')).toEqual({ name: 'test-value' });
  });

  it('returns null for a missing key', () => {
    expect(adapter.load('nonexistent')).toBeNull();
  });

  it('clears a key and removes it from storage', () => {
    adapter.save('test-key', { name: 'to-clear' });
    adapter.clear('test-key');
    expect(adapter.load('test-key')).toBeNull();
    expect(localStorage.getItem('test-key')).toBeNull();
  });

  it('returns null when localStorage contains invalid JSON', () => {
    localStorage.setItem('bad-key', 'invalid{json');
    expect(adapter.load('bad-key')).toBeNull();
  });

  it('overwrites existing data on save', () => {
    adapter.save('test-key', { name: 'first' });
    adapter.save('test-key', { name: 'second' });
    expect(adapter.load('test-key')).toEqual({ name: 'second' });
  });

  it('clear does not affect other keys', () => {
    adapter.save('key-a', { name: 'A' });
    adapter.save('key-b', { name: 'B' });
    adapter.clear('key-a');
    expect(adapter.load('key-b')).toEqual({ name: 'B' });
  });
});
