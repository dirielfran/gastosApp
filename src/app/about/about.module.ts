import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AboutPageRoutingModule } from './about-routing.module';
import { AboutPage } from './about.page';

@NgModule({
  imports: [CommonModule, IonicModule, TranslateModule, AboutPageRoutingModule],
  declarations: [AboutPage],
})
export class AboutPageModule {}
