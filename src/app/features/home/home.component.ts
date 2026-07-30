import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzInputModule } from 'ng-zorro-antd/input';
import {
  LucideShoppingCart,
  LucideCamera,
  LucidePlus,
  LucidePencil,
  LucideTrash2,
} from '@lucide/angular';
import { CartStoreService } from '@core/cart/cart-store';
import type { Cop } from '@core/money/money';
import { formatCop } from '@core/money/money';
import { APP_TEXT } from '@core/app-constants';
import { MetricsService } from '@core/metrics/metrics.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NzButtonModule,
    NzCardModule,
    NzModalModule,
    NzInputNumberModule,
    NzInputModule,
    LucideShoppingCart,
    LucideCamera,
    LucidePlus,
    LucidePencil,
    LucideTrash2,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly store = inject(CartStoreService);
  protected readonly metrics = inject(MetricsService);
  protected readonly text = APP_TEXT;
  protected readonly formatCop = formatCop;

  // Modal de edición
  protected editVisible = false;
  protected editForm = inject(FormBuilder).group({
    name: [''],
    price: [0 as Cop, [Validators.required, Validators.min(1)]],
    quantity: [1, [Validators.required, Validators.min(1)]],
  });
  private editingId: string | null = null;

  /** Abre el modal de edición para un ítem. */
  openEdit(item: { id: string; name: string | null; price: Cop; quantity: number }): void {
    this.editingId = item.id;
    this.editForm.setValue({
      name: item.name ?? '',
      price: item.price,
      quantity: item.quantity,
    });
    this.editVisible = true;
  }

  /** Guarda los cambios del modal. */
  saveEdit(): void {
    if (!this.editForm.valid || !this.editingId) return;
    const { name, price, quantity } = this.editForm.value;
    if (!price || !quantity) return;
    this.store.updateItem(this.editingId, { name: name || null, price, quantity });
    this.metrics.trackEvent({ type: 'item_edited', timestamp: Date.now() });
    this.editVisible = false;
  }

  /** Elimina un ítem directamente. */
  removeItem(id: string): void {
    this.store.removeItem(id);
    this.metrics.trackEvent({ type: 'item_deleted', timestamp: Date.now() });
  }
}
