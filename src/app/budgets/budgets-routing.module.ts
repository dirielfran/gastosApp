import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BudgetsPage } from './budgets.page';
import { BudgetFormPage } from './budget-form.page';

const routes: Routes = [
  { path: '', component: BudgetsPage },
  { path: 'new', component: BudgetFormPage },
  { path: ':id', component: BudgetFormPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BudgetsPageRoutingModule {}
