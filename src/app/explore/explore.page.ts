import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { DatabaseService } from '../core/database';
import { AccountService, CategoryService, MovementService, ExploreRefreshService } from '../core/services';
import type { Movement } from '../core/models/movement.model';
import type { MovementFilters } from '../core/services/movement.service';
import type { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  standalone: false,
})
export class ExplorePage implements OnInit, OnDestroy, ViewWillEnter {
  movements: Movement[] = [];
  accounts: { id: number; name: string; currencyCode: string }[] = [];
  categories: { id: number; nameKey: string | null; nameCustom: string | null }[] = [];
  filters: MovementFilters = {};
  loading = true;
  private refreshSub?: Subscription;

  constructor(
    private database: DatabaseService,
    private movementService: MovementService,
    private accountService: AccountService,
    private categoryService: CategoryService,
    private translate: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private exploreRefresh: ExploreRefreshService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.database.init();
    await this.loadAccountsAndCategories();
    await this.loadMovements();
    this.refreshSub = this.exploreRefresh.onRefreshRequested.subscribe(() => {
      if (this.database.isOpen()) {
        this.loadMovements();
      }
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  ionViewWillEnter(): void {
    if (this.database.isOpen()) {
      this.loadMovements();
    }
  }

  private async loadAccountsAndCategories(): Promise<void> {
    this.accounts = await this.accountService.getAll();
    this.categories = await this.categoryService.getAll();
  }

  async loadMovements(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();
    try {
      this.movements = await this.movementService.getAll(this.filters);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async onRefresh(event: CustomEvent): Promise<void> {
    await this.loadMovements();
    (event.target as HTMLIonRefresherElement).complete();
  }

  async applyFilters(f: Partial<MovementFilters>): Promise<void> {
    this.filters = { ...this.filters, ...f };
    await this.loadMovements();
  }

  goToAddMovement(): void {
    this.router.navigate(['/movement', 'new']);
  }

  goToEditMovement(id: number): void {
    this.router.navigate(['/movement', id]);
  }

  getCategoryName(c: { nameKey: string | null; nameCustom: string | null }): string {
    if (c.nameCustom) return c.nameCustom;
    if (c.nameKey) return this.translate.instant(c.nameKey);
    return '—';
  }

  getCategoryNameById(categoryId: number): string {
    const c = this.categories.find((cat) => cat.id === categoryId);
    return c ? this.getCategoryName(c) : '—';
  }
}
