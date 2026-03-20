import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DatabaseService } from './core/database';
import { ThemeService, ExploreRefreshService, RecurringService, BudgetAlertService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from './core/services';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  private routerSub?: Subscription;

  constructor(
    private database: DatabaseService,
    private theme: ThemeService,
    private translate: TranslateService,
    private settings: SettingsService,
    private router: Router,
    private exploreRefresh: ExploreRefreshService,
    private recurringService: RecurringService,
    private budgetAlertService: BudgetAlertService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.database.init();
    } catch {
      return;
    }
    await this.theme.init();
    const lang = await this.settings.getSetting(this.settings.keys.LANGUAGE, 'es');
    if (lang && ['es', 'en', 'pt'].includes(lang)) {
      this.translate.use(lang);
    }
    const onboarded = await this.settings.getSetting(this.settings.keys.ONBOARDING_COMPLETED, '');
    if (onboarded !== 'true') {
      this.router.navigate(['/onboarding'], { replaceUrl: true });
    }

    this.recurringService.applyRecurringForCurrentMonth().catch(() => {});
    this.budgetAlertService.cleanupOldAlertKeys().catch(() => {});

    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        if (e.urlAfterRedirects === '/tabs/explore') {
          this.exploreRefresh.requestRefresh();
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }
}
