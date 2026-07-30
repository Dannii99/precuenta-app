import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'manual',
    loadComponent: () =>
      import('./features/manual-entry/manual-entry.component').then(
        (m) => m.ManualEntryComponent,
      ),
  },
];
