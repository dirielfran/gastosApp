import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from '../core/database';
import { BudgetService, CategoryService } from '../core/services';
import { TranslateService } from '@ngx-translate/core';
import type { Budget } from '../core/models/budget.model';
import type { Category } from '../core/models/category.model';
import type { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.page.html',
  styleUrls: ['./budgets.page.scss'],
  standalone: false,
})
export class BudgetsPage implements OnInit, ViewWillEnter {
  budgets: Budget[] = [];
  categories: Category[] = [];
  /** Gasto del mes actual por budget.id */
  spentByBudgetId: Record<number, number> = {};
  loading = true;

  constructor(
    private database: DatabaseService,
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private translate: TranslateService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.database.init();
    await this.load();
  }

  ionViewWillEnter(): void {
    if (this.database.isOpen()) {
      this.load();
    }
  }

  async load(): Promise<void> {
    this.loading = true;
    this.spentByBudgetId = {};
    try {
      this.budgets = await this.budgetService.getAll();
      this.categories = await this.categoryService.getAll();
      const { dateFrom, dateTo } = this.getCurrentMonthRange();
      const spentAll = await this.budgetService.getSpentByAllCategories(dateFrom, dateTo);
      const spentMap = new Map(spentAll.map((s) => [s.categoryId, s.expense]));
      for (const b of this.budgets) {
        this.spentByBudgetId[b.id] = spentMap.get(b.categoryId) ?? 0;
      }
    } finally {
      this.loading = false;
    }
  }

  private getCurrentMonthRange(): { dateFrom: string; dateTo: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      dateFrom: start.toISOString().slice(0, 10),
      dateTo: end.toISOString().slice(0, 10),
    };
  }

  getSpent(b: Budget): number {
    return this.spentByBudgetId[b.id] ?? 0;
  }

  /** Porcentaje gastado respecto al límite (puede ser > 100). */
  getProgressPercent(b: Budget): number {
    if (b.amountLimit <= 0) return 0;
    return Math.min(100, (this.getSpent(b) / b.amountLimit) * 100);
  }

  /** 'success' | 'warning' | 'danger' para barra y estado. */
  getProgressColor(b: Budget): 'success' | 'warning' | 'danger' {
    const spent = this.getSpent(b);
    if (spent >= b.amountLimit) return 'danger';
    const threshold = (b.amountLimit * b.alertThresholdPercent) / 100;
    if (spent >= threshold) return 'warning';
    return 'success';
  }

  getCategoryName(categoryId: number): string {
    const c = this.categories.find((x) => x.id === categoryId);
    if (!c) return '—';
    if (c.nameCustom) return c.nameCustom;
    if (c.nameKey) return this.translate.instant(c.nameKey);
    return '—';
  }

  goToNew(): void {
    this.router.navigate(['/budgets', 'new']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/budgets', id]);
  }
}
