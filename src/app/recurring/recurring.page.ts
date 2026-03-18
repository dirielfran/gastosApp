import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from '../core/database';
import { RecurringService, CategoryService } from '../core/services';
import { TranslateService } from '@ngx-translate/core';
import type { RecurringMovement } from '../core/models/recurring.model';
import type { Category } from '../core/models/category.model';
import type { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-recurring',
  templateUrl: './recurring.page.html',
  styleUrls: ['./recurring.page.scss'],
  standalone: false,
})
export class RecurringPage implements OnInit, ViewWillEnter {
  items: RecurringMovement[] = [];
  categories: Category[] = [];
  loading = true;

  constructor(
    private database: DatabaseService,
    private recurringService: RecurringService,
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
      this.items = await this.recurringService.getAll();
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
    this.router.navigate(['/recurring', 'new']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/recurring', id]);
  }
}
