import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AccountsPageRoutingModule } from './accounts-routing.module';
import { AccountsPage } from './accounts.page';
import { AccountFormPage } from './account-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    AccountsPageRoutingModule,
  ],
  declarations: [AccountsPage, AccountFormPage],
})
export class AccountsPageModule {}
