import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../core/database';
import { BudgetService, CategoryService, SettingsService } from '../core/services';
import { TranslateService } from '@ngx-translate/core';
import { formatCurrency } from '../core/utils';
import type { Category } from '../core/models/category.model';

export type PeriodKey = 'this_month' | 'last_month' | 'last_3_months' | 'this_year';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
  standalone: false,
})
export class StatisticsPage implements OnInit {
  period: PeriodKey = 'this_month';
  categories: Category[] = [];
  /** Por categoría: gasto en el periodo */
  spentByCategoryId: Record<number, number> = {};
  totalExpense = 0;
  totalIncome = 0;
  incomeByCategoryId: Record<number, number> = {};
  loading = true;
  locale = 'es';
  currencyCode = 'EUR';

  constructor(
    private database: DatabaseService,
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private settings: SettingsService,
    private translate: TranslateService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.database.init();
    this.locale = await this.settings.getSetting(this.settings.keys.LANGUAGE, 'es');
    this.currencyCode = await this.settings.getSetting(this.settings.keys.DEFAULT_CURRENCY, 'EUR');
    await this.load();
  }

  async onPeriodChange(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.spentByCategoryId = {};
    this.incomeByCategoryId = {};
    this.totalExpense = 0;
    this.totalIncome = 0;
    try {
      this.categories = await this.categoryService.getAll();
      const { dateFrom, dateTo } = this.getPeriodRange();
      const rows = await this.budgetService.getSpentByAllCategories(dateFrom, dateTo);
      for (const r of rows) {
        this.spentByCategoryId[r.categoryId] = r.expense;
        this.incomeByCategoryId[r.categoryId] = r.income;
        this.totalExpense += r.expense;
        this.totalIncome += r.income;
      }
    } finally {
      this.loading = false;
    }
  }

  private getPeriodRange(): { dateFrom: string; dateTo: string } {
    const now = new Date();
    let start: Date;
    let end: Date;
    switch (this.period) {
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'last_3_months':
        start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'this_year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    return {
      dateFrom: start.toISOString().slice(0, 10),
      dateTo: end.toISOString().slice(0, 10),
    };
  }

  getSpent(categoryId: number): number {
    return this.spentByCategoryId[categoryId] ?? 0;
  }

  getCategoryName(c: Category): string {
    if (c.nameCustom) return c.nameCustom;
    if (c.nameKey) return this.translate.instant(c.nameKey);
    return '—';
  }

  /** Categorías con gasto > 0 en el periodo, ordenadas por gasto descendente. */
  get sortedCategories(): Category[] {
    return [...this.categories]
      .filter((c) => this.getSpent(c.id) > 0)
      .sort((a, b) => this.getSpent(b.id) - this.getSpent(a.id));
  }

  get maxSpent(): number {
    const cats = this.sortedCategories;
    if (cats.length === 0) return 1;
    return this.getSpent(cats[0].id) || 1;
  }

  getBarWidth(categoryId: number): number {
    return Math.round((this.getSpent(categoryId) / this.maxSpent) * 100);
  }

  getIncome(categoryId: number): number {
    return this.incomeByCategoryId[categoryId] ?? 0;
  }

  get sortedIncomeCategories(): Category[] {
    return [...this.categories]
      .filter((c) => this.getIncome(c.id) > 0)
      .sort((a, b) => this.getIncome(b.id) - this.getIncome(a.id));
  }

  formatMoney(amount: number): string {
    return formatCurrency(amount, this.currencyCode, this.locale);
  }
}
