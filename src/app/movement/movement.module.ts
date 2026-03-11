import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { MovementPageRoutingModule } from './movement-routing.module';
import { MovementPage } from './movement.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    MovementPageRoutingModule,
  ],
  declarations: [MovementPage],
})
export class MovementPageModule {}
