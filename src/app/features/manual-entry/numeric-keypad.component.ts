import {
  ChangeDetectionStrategy,
  Component,
  output,
  input,
} from '@angular/core';

@Component({
  selector: 'app-numeric-keypad',
  standalone: true,
  template: `
    <div class="keypad-grid">
      @for (row of keys; track $index) {
        @for (k of row; track k) {
          <button
            type="button"
            class="keypad-btn"
            [class.keypad-btn--action]="k === '⌫' || k === 'C'"
            [attr.aria-label]="k === '⌫' ? 'Borrar último dígito' : k === 'C' ? 'Limpiar' : k === '0' ? 'Cero' : undefined"
            [disabled]="disabled()"
            (click)="keyPressed.emit(k)"
          >
            {{ k }}
          </button>
        }
      }
    </div>
  `,
  styles: [`
    .keypad-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      max-width: 320px;
      margin: 0 auto;
      user-select: none;
    }

    .keypad-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 56px;
      font-size: 1.4rem;
      font-weight: 500;
      border: 1px solid #d9d9d9;
      border-radius: 12px;
      background: #fff;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }

    .keypad-btn:focus-visible {
      outline: 2px solid #1890ff;
      outline-offset: 2px;
    }

    .keypad-btn:active:not(:disabled) {
      background: #e6f7ff;
      transform: scale(0.95);
    }

    .keypad-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .keypad-btn--action {
      color: #ff4d4f;
      font-size: 1rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumericKeypadComponent {
  readonly disabled = input(false);
  readonly keyPressed = output<string>();

  protected readonly keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', '⌫'],
  ];
}
