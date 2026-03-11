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
    try {
      this.budgets = await this.budgetService.getAll();
      this.categories = await this.categoryService.getAll();
    } finally {
      this.loading = false;
    }
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
