import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountsPage } from './accounts.page';
import { AccountFormPage } from './account-form.page';

const routes: Routes = [
  { path: '', component: AccountsPage },
  { path: 'new', component: AccountFormPage },
  { path: ':id', component: AccountFormPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountsPageRoutingModule {}
