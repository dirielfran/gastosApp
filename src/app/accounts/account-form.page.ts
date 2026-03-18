import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DatabaseService } from '../core/database';
import { AccountService } from '../core/services';
import type { AccountCreate } from '../core/models/account.model';

const CURRENCIES = ['EUR', 'USD', 'GBP', 'COP', 'BRL', 'MXN', 'ARS', 'CLP'];

const ACCOUNT_ICONS = [
  'wallet-outline', 'card-outline', 'cash-outline', 'business-outline',
  'home-outline', 'briefcase-outline', 'piggy-bank-outline', 'diamond-outline',
  'globe-outline', 'phone-portrait-outline', 'laptop-outline', 'car-outline',
];

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.page.html',
  styleUrls: ['./account-form.page.scss'],
  standalone: false,
})
export class AccountFormPage implements OnInit {
  id: number | null = null;
  name = '';
  currencyCode = 'EUR';
  icon = 'wallet-outline';
  color = '#1976D2';
  currencies = CURRENCIES;
  readonly iconOptions = ACCOUNT_ICONS;
  saving = false;

  constructor(
    private database: DatabaseService,
    private accountService: AccountService,
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
      const acc = await this.accountService.getById(this.id);
      if (acc) {
        this.name = acc.name;
        this.currencyCode = acc.currencyCode;
        this.icon = acc.icon ?? 'wallet-outline';
        this.color = acc.color ?? '#1976D2';
      }
    }
  }

  async save(): Promise<void> {
    if (!this.name.trim()) return;
    this.saving = true;
    try {
      if (this.id != null) {
        await this.accountService.update(this.id, {
          name: this.name.trim(),
          currencyCode: this.currencyCode,
          icon: this.icon,
          color: this.color,
        });
      } else {
        await this.accountService.create({
          name: this.name.trim(),
          currencyCode: this.currencyCode,
          icon: this.icon,
          color: this.color,
          isActive: 1,
        });
      }
      this.router.navigate(['/accounts']);
    } finally {
      this.saving = false;
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
    await this.accountService.delete(this.id);
    this.router.navigate(['/accounts']);
  }

  cancel(): void {
    this.router.navigate(['/accounts']);
  }
}
