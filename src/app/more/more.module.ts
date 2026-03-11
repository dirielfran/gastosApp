import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { MorePageRoutingModule } from './more-routing.module';
import { MorePage } from './more.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    TranslateModule,
    MorePageRoutingModule,
  ],
  declarations: [MorePage],
})
export class MorePageModule {}
