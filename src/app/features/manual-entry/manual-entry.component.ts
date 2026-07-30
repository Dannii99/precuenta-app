import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { LucideArrowLeft, LucideShoppingCart } from '@lucide/angular';
import { CartStoreService } from '@core/cart/cart-store';
import { formatCop } from '@core/money/money';
import type { Cop } from '@core/money/money';
import { APP_TEXT } from '@core/app-constants';
import { MetricsService } from '@core/metrics/metrics.service';
import { NumericKeypadComponent } from './numeric-keypad.component';

@Component({
  selector: 'app-manual-entry',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    LucideArrowLeft,
    LucideShoppingCart,
    NumericKeypadComponent,
  ],
  templateUrl: './manual-entry.component.html',
  styleUrls: ['./manual-entry.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualEntryComponent {
  private readonly store = inject(CartStoreService);
  private readonly metrics = inject(MetricsService);
  private readonly router = inject(Router);
  protected readonly text = APP_TEXT;
  protected readonly formatCop = formatCop;

  protected readonly form = inject(FormBuilder).group({
    price: [0 as Cop, [Validators.required, Validators.min(1)]],
    name: [''],
  });

  protected added = false;
  protected addedPrice: Cop = 0;

  /** Maneja la tecla presionada en el keypad. */
  onKey(key: string): void {
    const priceControl = this.form.get('price');
    if (!priceControl) return;
    const current = priceControl.value ?? 0;
    if (key === '⌫') {
      priceControl.setValue(Math.floor(current / 10));
    } else if (key === 'C') {
      priceControl.setValue(0);
    } else {
      const digit = Number(key);
      const next = current * 10 + digit;
      if (next <= 999_999_999) {
        priceControl.setValue(next);
      }
    }
  }

  confirmar(): void {
    if (!this.form.valid || this.added) return;
    const { price, name } = this.form.value;
    if (!price || price <= 0) return;

    this.store.addItem({
      id: crypto.randomUUID(),
      name: name || null,
      price,
      quantity: 1,
    });

    this.metrics.trackEvent({
      type: 'item_added',
      timestamp: Date.now(),
      metadata: { source: 'manual' },
    });

    this.added = true;
    this.addedPrice = price;

    setTimeout(() => {
      void this.router.navigateByUrl('/');
    }, 600);
  }
}
