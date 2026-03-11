import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from '../core/database';
import { CategoryService } from '../core/services';
import { TranslateService } from '@ngx-translate/core';
import type { Category } from '../core/models/category.model';
import type { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: false,
})
export class CategoriesPage implements OnInit, ViewWillEnter {
  categories: Category[] = [];
  loading = true;

  constructor(
    private database: DatabaseService,
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
      this.categories = await this.categoryService.getAll();
    } finally {
      this.loading = false;
    }
  }

  getDisplayName(c: Category): string {
    if (c.nameCustom) return c.nameCustom;
    if (c.nameKey) return this.translate.instant(c.nameKey);
    return '—';
  }

  goToNew(): void {
    this.router.navigate(['/categories', 'new']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/categories', id]);
  }
}
