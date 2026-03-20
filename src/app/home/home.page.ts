import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from '../core/database';
import { AccountService, BudgetService, CategoryService, MovementService, SettingsService } from '../core/services';
import { TranslateService } from '@ngx-translate/core';
import { formatCurrency } from '../core/utils';
import type { Account } from '../core/models/account.model';
import type { Category } from '../core/models/category.model';
import type { Movement } from '../core/models/movement.model';
import type { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, ViewWillEnter {
  income = 0;
  expense = 0;
  balance = 0;
  loading = true;
  locale = 'es';
  currencyCode = 'EUR';

  accounts: Account[] = [];
  categories: Category[] = [];
  recentMovements: Movement[] = [];
  budgetAlerts: { name: string; spent: number; limit: number; percent: number }[] = [];

  constructor(
    private database: DatabaseService,
    private movementService: MovementService,
    private accountService: AccountService,
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private settings: SettingsService,
    private translate: TranslateService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.database.init();
    this.locale = await this.settings.getSetting(this.settings.keys.LANGUAGE, 'es');
    this.currencyCode = await this.settings.getSetting(this.settings.keys.DEFAULT_CURRENCY, 'EUR');
    await this.loadDashboard();
  }

  async ionViewWillEnter(): Promise<void> {
    if (this.database.isOpen()) {
      this.locale = await this.settings.getSetting(this.settings.keys.LANGUAGE, 'es');
      this.currencyCode = await this.settings.getSetting(this.settings.keys.DEFAULT_CURRENCY, 'EUR');
      await this.loadDashboard();
    }
  }

  private getThisMonthRange(): { from: string; to: string } {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return {
      from: `${y}-${m}-01`,
      to: `${y}-${m}-${String(new Date(y, now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`,
    };
  }

  async loadDashboard(): Promise<void> {
    this.loading = true;
    try {
      const { from, to } = this.getThisMonthRange();
      const totals = await this.movementService.getTotalsByType(from, to);
      this.income = totals.income;
      this.expense = totals.expense;
      this.balance = totals.income - totals.expense;

      this.accounts = await this.accountService.getAll();
      this.categories = await this.categoryService.getAll();

      const allMovements = await this.movementService.getAll({ dateFrom: from, dateTo: to, limit: 5 });
      this.recentMovements = allMovements;

      this.budgetAlerts = [];
      const budgets = await this.budgetService.getAll();
      const spentMap = await this.budgetService.getSpentByAllCategories(from, to);
      const spentLookup = new Map(spentMap.map((s) => [s.categoryId, s.expense]));

      for (const b of budgets) {
        const spent = spentLookup.get(b.categoryId) ?? 0;
        const threshold = (b.amountLimit * b.alertThresholdPercent) / 100;
        if (spent >= threshold) {
          this.budgetAlerts.push({
            name: this.getCategoryNameById(b.categoryId),
            spent,
            limit: b.amountLimit,
            percent: b.amountLimit > 0 ? Math.round((spent / b.amountLimit) * 100) : 0,
          });
        }
      }
    } finally {
      this.loading = false;
    }
  }

  async onRefresh(event: CustomEvent): Promise<void> {
    await this.loadDashboard();
    (event.target as HTMLIonRefresherElement).complete();
  }

  getCategoryNameById(categoryId: number): string {
    const c = this.categories.find((cat) => cat.id === categoryId);
    if (!c) return '—';
    if (c.nameCustom) return c.nameCustom;
    if (c.nameKey) return this.translate.instant(c.nameKey);
    return '—';
  }

  formatMoney(amount: number): string {
    return formatCurrency(amount, this.currencyCode, this.locale);
  }

  formatAccountMoney(amount: number | undefined, code: string): string {
    return formatCurrency(amount ?? 0, code, this.locale);
  }

  goToAddMovement(): void {
    this.router.navigate(['/movement', 'new']);
  }

  goToTransfer(): void {
    this.router.navigate(['/transfer']);
  }

  goToMovement(id: number): void {
    this.router.navigate(['/movement', id]);
  }
}
