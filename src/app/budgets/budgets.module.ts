import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { BudgetsPageRoutingModule } from './budgets-routing.module';
import { BudgetsPage } from './budgets.page';
import { BudgetFormPage } from './budget-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    BudgetsPageRoutingModule,
  ],
  declarations: [BudgetsPage, BudgetFormPage],
})
export class BudgetsPageModule {}
