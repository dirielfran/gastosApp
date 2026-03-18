import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { StatisticsPageRoutingModule } from './statistics-routing.module';
import { StatisticsPage } from './statistics.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    StatisticsPageRoutingModule,
  ],
  declarations: [StatisticsPage],
})
export class StatisticsPageModule {}
