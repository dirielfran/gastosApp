import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from '../core/database';
import { AccountService, BudgetService, MovementService, SettingsService } from '../core/services';
import { TranslateService } from '@ngx-translate/core';
import { formatCurrency } from '../core/utils';
import type { Account } from '../core/models/account.model';
import type { Budget } from '../core/models/budget.model';
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
  recentMovements: Movement[] = [];
  budgetAlerts: { name: string; spent: number; limit: number; percent: number }[] = [];

  constructor(
    private database: DatabaseService,
    private movementService: MovementService,
    private accountService: AccountService,
    private budgetService: BudgetService,
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

      const allMovements = await this.movementService.getAll({ dateFrom: from, dateTo: to });
      this.recentMovements = allMovements.slice(0, 5);

      this.budgetAlerts = [];
      const budgets = await this.budgetService.getAll();
      for (const b of budgets) {
        const spent = await this.budgetService.getSpentInCategory(b.categoryId, from, to);
        const threshold = (b.amountLimit * b.alertThresholdPercent) / 100;
        if (spent >= threshold) {
          const cats = await this.budgetService.getByCategoryId(b.categoryId);
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

  private getCategoryNameById(categoryId: number): string {
    return `#${categoryId}`;
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
