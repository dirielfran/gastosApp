import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DatabaseService } from '../core/database';
import { CategoryService } from '../core/services';

const CATEGORY_ICONS = [
  'pricetag-outline', 'restaurant-outline', 'car-outline', 'bicycle-outline',
  'fitness-outline', 'game-controller-outline', 'medical-outline', 'home-outline',
  'card-outline', 'cash-outline', 'wallet-outline', 'cart-outline',
  'airplane-outline', 'bus-outline', 'school-outline', 'book-outline',
  'gift-outline', 'heart-outline', 'cafe-outline', 'beer-outline',
  'shirt-outline', 'phone-portrait-outline', 'flash-outline', 'construct-outline',
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
    private toastCtrl: ToastController,
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
    } catch {
      const toast = await this.toastCtrl.create({
        message: this.translate.instant('COMMON.SAVE_ERROR'),
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  async confirmDelete(): Promise<void> {
    if (this.id == null) return;

    const count = await this.categoryService.countMovementsByCategoryId(this.id);
    if (count > 0) {
      const toast = await this.toastCtrl.create({
        message: this.translate.instant('COMMON.HAS_MOVEMENTS', { count }),
        duration: 4000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

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
    try {
      await this.categoryService.delete(this.id);
      this.router.navigate(['/categories']);
    } catch {
      const toast = await this.toastCtrl.create({
        message: this.translate.instant('COMMON.DELETE_ERROR'),
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  cancel(): void {
    this.router.navigate(['/categories']);
  }
}
