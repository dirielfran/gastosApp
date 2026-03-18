import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { SettingsService, ThemeService, BackupService } from '../core/services';
import { TranslateService } from '@ngx-translate/core';
import type { ThemeMode } from '../core/models/settings.model';

const CURRENCIES = ['EUR', 'USD', 'GBP', 'COP', 'BRL', 'MXN', 'ARS', 'CLP'];

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false,
})
export class SettingsPage implements OnInit {
  language = 'es';
  theme: ThemeMode = 'system';
  currency = 'EUR';
  currencies = CURRENCIES;
  budgetAlertsEnabled = true;
  languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' },
  ];
  themes: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: 'SETTINGS.THEME_LIGHT' },
    { value: 'dark', label: 'SETTINGS.THEME_DARK' },
    { value: 'system', label: 'SETTINGS.THEME_SYSTEM' },
  ];

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private settings: SettingsService,
    private themeService: ThemeService,
    private backupService: BackupService,
    private translate: TranslateService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.language = await this.settings.getSetting(this.settings.keys.LANGUAGE, 'es');
    this.theme = (await this.themeService.getTheme()) as ThemeMode;
    this.currency = await this.settings.getSetting(this.settings.keys.DEFAULT_CURRENCY, 'EUR');
    const alerts = await this.settings.getSetting(this.settings.keys.BUDGET_ALERTS_ENABLED, 'true');
    this.budgetAlertsEnabled = alerts === 'true';
  }

  async onLanguageChange(): Promise<void> {
    await this.settings.setSetting(this.settings.keys.LANGUAGE, this.language);
    this.translate.use(this.language);
  }

  async onThemeChange(): Promise<void> {
    await this.themeService.setTheme(this.theme);
  }

  async onCurrencyChange(): Promise<void> {
    await this.settings.setSetting(this.settings.keys.DEFAULT_CURRENCY, this.currency);
  }

  async onBudgetAlertsChange(): Promise<void> {
    await this.settings.setSetting(
      this.settings.keys.BUDGET_ALERTS_ENABLED,
      this.budgetAlertsEnabled ? 'true' : 'false'
    );
  }

  async exportBackup(): Promise<void> {
    await this.backupService.exportBackup();
    const toast = await this.toastCtrl.create({
      message: this.translate.instant('SETTINGS.BACKUP_EXPORTED'),
      duration: 2000,
      color: 'success',
    });
    await toast.present();
  }

  triggerImport(): void {
    this.fileInput?.nativeElement?.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      await this.backupService.importBackup(file);
      const toast = await this.toastCtrl.create({
        message: this.translate.instant('SETTINGS.BACKUP_IMPORTED'),
        duration: 2000,
        color: 'success',
      });
      await toast.present();
    } catch {
      const toast = await this.toastCtrl.create({
        message: this.translate.instant('COMMON.ERROR'),
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
    input.value = '';
  }

  goBack(): void {
    this.router.navigate(['/tabs/more']);
  }
}
