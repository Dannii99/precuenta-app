import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsService } from './metrics.service';
import type { MetricsEvent } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    localStorage.clear();
    service = new MetricsService();
  });

  it('tracks a single event and persists to localStorage', () => {
    const event: MetricsEvent = {
      type: 'item_added',
      timestamp: Date.now(),
    };
    service.trackEvent(event);

    const raw = localStorage.getItem('__metrics_queue');
    expect(raw).not.toBeNull();

    const queue = JSON.parse(raw!) as MetricsEvent[];
    expect(queue).toHaveLength(1);
    expect(queue[0].type).toBe('item_added');
  });

  it('tracks events with metadata', () => {
    const event: MetricsEvent = {
      type: 'session_started',
      timestamp: 1000,
      metadata: { source: 'login' },
    };
    service.trackEvent(event);

    const queue = JSON.parse(localStorage.getItem('__metrics_queue')!) as MetricsEvent[];
    expect(queue[0].metadata).toEqual({ source: 'login' });
  });

  it('caps the queue at 200 events and drops the oldest (FIFO)', () => {
    for (let i = 0; i < 210; i++) {
      service.trackEvent({ type: 'item_added', timestamp: i });
    }

    const raw = localStorage.getItem('__metrics_queue');
    const queue = JSON.parse(raw!) as MetricsEvent[];
    expect(queue).toHaveLength(200);

    // The first kept event should be timestamp 10 (indices 0…9 dropped)
    expect(queue[0].timestamp).toBe(10);
    expect(queue[199].timestamp).toBe(209);
  });

  it('recovers from a corrupted queue in localStorage', () => {
    localStorage.setItem('__metrics_queue', 'corrupted-data');

    const event: MetricsEvent = { type: 'item_edited', timestamp: 999 };
    service.trackEvent(event);

    const queue = JSON.parse(localStorage.getItem('__metrics_queue')!) as MetricsEvent[];
    expect(queue).toHaveLength(1);
    expect(queue[0].timestamp).toBe(999);
  });

  it('preserves multiple event types in sequence', () => {
    service.trackEvent({ type: 'session_started', timestamp: 1 });
    service.trackEvent({ type: 'item_added', timestamp: 2 });
    service.trackEvent({ type: 'item_edited', timestamp: 3 });
    service.trackEvent({ type: 'item_deleted', timestamp: 4 });
    service.trackEvent({ type: 'cart_restored', timestamp: 5 });

    const queue = JSON.parse(localStorage.getItem('__metrics_queue')!) as MetricsEvent[];
    expect(queue).toHaveLength(5);
    expect(queue.map((e) => e.type)).toEqual([
      'session_started',
      'item_added',
      'item_edited',
      'item_deleted',
      'cart_restored',
    ]);
  });
});
