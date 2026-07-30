import { Injectable } from '@angular/core';

export interface MetricsEvent {
  type: 'item_added' | 'item_edited' | 'item_deleted' | 'cart_restored' | 'session_started';
  timestamp: number;
  metadata?: Record<string, string>;
}

const STORAGE_KEY = '__metrics_queue';
const MAX_QUEUE_SIZE = 200;

@Injectable({ providedIn: 'root' })
export class MetricsService {
  trackEvent(event: MetricsEvent): void {
    if (typeof localStorage === 'undefined') return;

    const raw = localStorage.getItem(STORAGE_KEY);
    let queue: MetricsEvent[] = [];

    if (raw !== null) {
      try {
        queue = JSON.parse(raw) as MetricsEvent[];
      } catch {
        queue = [];
      }
    }

    queue.push(event);

    if (queue.length > MAX_QUEUE_SIZE) {
      queue = queue.slice(queue.length - MAX_QUEUE_SIZE);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  }
}
