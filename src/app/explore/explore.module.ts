import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ExplorePageRoutingModule } from './explore-routing.module';
import { ExplorePage } from './explore.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    ExplorePageRoutingModule,
  ],
  declarations: [ExplorePage],
})
export class ExplorePageModule {}
