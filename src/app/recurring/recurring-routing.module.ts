import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecurringPage } from './recurring.page';
import { RecurringFormPage } from './recurring-form.page';

const routes: Routes = [
  { path: '', component: RecurringPage },
  { path: 'new', component: RecurringFormPage },
  { path: ':id', component: RecurringFormPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecurringPageRoutingModule {}
