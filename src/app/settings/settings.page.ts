import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService, ThemeService } from '../core/services';
import { TranslateService } from '@ngx-translate/core';
import type { ThemeMode } from '../core/models/settings.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false,
})
export class SettingsPage implements OnInit {
  language = 'es';
  theme: ThemeMode = 'system';
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

  constructor(
    private settings: SettingsService,
    private themeService: ThemeService,
    private translate: TranslateService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.language = await this.settings.getSetting(this.settings.keys.LANGUAGE, 'es');
    this.theme = (await this.themeService.getTheme()) as ThemeMode;
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

  async onBudgetAlertsChange(): Promise<void> {
    await this.settings.setSetting(
      this.settings.keys.BUDGET_ALERTS_ENABLED,
      this.budgetAlertsEnabled ? 'true' : 'false'
    );
  }

  goBack(): void {
    this.router.navigate(['/tabs/more']);
  }
}
