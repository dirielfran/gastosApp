import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesPage } from './categories.page';
import { CategoryFormPage } from './category-form.page';

const routes: Routes = [
  { path: '', component: CategoriesPage },
  { path: 'new', component: CategoryFormPage },
  { path: ':id', component: CategoryFormPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoriesPageRoutingModule {}
