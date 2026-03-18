import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DatabaseService } from '../core/database';
import { CategoryService } from '../core/services';
import type { CategoryCreate } from '../core/models/category.model';

/** Iconos disponibles para categorías (ionicons outline). */
const CATEGORY_ICONS = [
  'pricetag-outline',
  'restaurant-outline',
  'car-outline',
  'bicycle-outline',
  'fitness-outline',
  'game-controller-outline',
  'medical-outline',
  'home-outline',
  'card-outline',
  'cash-outline',
  'wallet-outline',
  'cart-outline',
  'airplane-outline',
  'bus-outline',
  'school-outline',
  'book-outline',
  'gift-outline',
  'heart-outline',
  'cafe-outline',
  'beer-outline',
  'shirt-outline',
  'phone-portrait-outline',
  'flash-outline',
  'construct-outline',
];

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.page.html',
  styleUrls: ['./category-form.page.scss'],
  standalone: false,
})
export class CategoryFormPage implements OnInit {
  id: number | null = null;
  nameCustom = '';
  icon = 'pricetag-outline';
  color = '#1976D2';
  isNew = true;
  readonly iconOptions = CATEGORY_ICONS;

  constructor(
    private database: DatabaseService,
    private categoryService: CategoryService,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.database.init();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.id = +idParam;
      this.isNew = false;
      const cat = await this.categoryService.getById(this.id);
      if (cat) {
        this.nameCustom = cat.nameCustom ?? '';
        this.icon = cat.icon ?? 'pricetag-outline';
        this.color = cat.color ?? '#1976D2';
      }
    }
  }

  async save(): Promise<void> {
    try {
      if (this.id != null) {
        await this.categoryService.update(this.id, {
          nameCustom: this.nameCustom.trim() || null,
          icon: this.icon,
          color: this.color,
        });
      } else {
        await this.categoryService.create({
          nameKey: null,
          nameCustom: this.nameCustom.trim() || null,
          isDefault: 0,
          icon: this.icon,
          color: this.color,
          isActive: 1,
        });
      }
      this.router.navigate(['/categories']);
    } catch (e) {
      console.error(e);
    }
  }

  async confirmDelete(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('COMMON.CONFIRM_DELETE_TITLE'),
      message: this.translate.instant('COMMON.CONFIRM_DELETE_MSG'),
      buttons: [
        { text: this.translate.instant('COMMON.CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('COMMON.DELETE'),
          role: 'destructive',
          handler: () => this.doDelete(),
        },
      ],
    });
    await alert.present();
  }

  private async doDelete(): Promise<void> {
    if (this.id == null) return;
    await this.categoryService.delete(this.id);
    this.router.navigate(['/categories']);
  }

  cancel(): void {
    this.router.navigate(['/categories']);
  }
}
