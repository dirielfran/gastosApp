import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { RecurringPageRoutingModule } from './recurring-routing.module';
import { RecurringPage } from './recurring.page';
import { RecurringFormPage } from './recurring-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    RecurringPageRoutingModule,
  ],
  declarations: [RecurringPage, RecurringFormPage],
})
export class RecurringPageModule {}
