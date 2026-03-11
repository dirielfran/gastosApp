import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../core/database';
import { BudgetService, CategoryService } from '../core/services';
import { TranslateService } from '@ngx-translate/core';
import type { Category } from '../core/models/category.model';

@Component({
  selector: 'app-budget-form',
  templateUrl: './budget-form.page.html',
  styleUrls: ['./budget-form.page.scss'],
  standalone: false,
})
export class BudgetFormPage implements OnInit {
  id: number | null = null;
  categoryId: number | null = null;
  amountLimit = 0;
  alertThresholdPercent = 80;
  categories: Category[] = [];
  saving = false;

  constructor(
    private database: DatabaseService,
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.database.init();
    this.categories = await this.categoryService.getAll();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.id = +idParam;
      const b = await this.budgetService.getById(this.id);
      if (b) {
        this.categoryId = b.categoryId;
        this.amountLimit = b.amountLimit;
        this.alertThresholdPercent = b.alertThresholdPercent;
      }
    } else if (this.categories.length > 0) {
      this.categoryId = this.categories[0].id;
    }
  }

  getCategoryName(c: Category): string {
    if (c.nameCustom) return c.nameCustom;
    if (c.nameKey) return this.translate.instant(c.nameKey);
    return '—';
  }

  async save(): Promise<void> {
    if (this.categoryId == null || this.amountLimit <= 0) return;
    this.saving = true;
    try {
      if (this.id != null) {
        await this.budgetService.update(this.id, {
          categoryId: this.categoryId,
          amountLimit: this.amountLimit,
          alertThresholdPercent: this.alertThresholdPercent,
        });
      } else {
        await this.budgetService.create({
          categoryId: this.categoryId,
          amountLimit: this.amountLimit,
          period: 'monthly',
          alertThresholdPercent: this.alertThresholdPercent,
          isActive: 1,
        });
      }
      this.router.navigate(['/budgets']);
    } finally {
      this.saving = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/budgets']);
  }
}
