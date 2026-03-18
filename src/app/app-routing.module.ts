import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'tabs/home', pathMatch: 'full' },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'accounts',
    loadChildren: () =>
      import('./accounts/accounts.module').then((m) => m.AccountsPageModule),
  },
  {
    path: 'categories',
    loadChildren: () =>
      import('./categories/categories.module').then((m) => m.CategoriesPageModule),
  },
  {
    path: 'budgets',
    loadChildren: () =>
      import('./budgets/budgets.module').then((m) => m.BudgetsPageModule),
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./settings/settings.module').then((m) => m.SettingsPageModule),
  },
  {
    path: 'statistics',
    loadChildren: () =>
      import('./statistics/statistics.module').then((m) => m.StatisticsPageModule),
  },
  {
    path: 'transfer',
    loadChildren: () =>
      import('./transfer/transfer.module').then((m) => m.TransferPageModule),
  },
  {
    path: 'recurring',
    loadChildren: () =>
      import('./recurring/recurring.module').then((m) => m.RecurringPageModule),
  },
  {
    path: 'about',
    loadChildren: () =>
      import('./about/about.module').then((m) => m.AboutPageModule),
  },
  {
    path: 'movement/:id',
    loadChildren: () =>
      import('./movement/movement.module').then((m) => m.MovementPageModule),
  },
  { path: '**', redirectTo: 'tabs/home' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
