import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DatabaseService } from '../core/database';
import { AccountService } from '../core/services';
import { formatCurrency } from '../core/utils';
import type { Account } from '../core/models/account.model';
import type { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
  standalone: false,
})
export class AccountsPage implements OnInit, ViewWillEnter {
  accounts: Account[] = [];
  loading = true;
  error: string | null = null;
  locale = 'es';

  constructor(
    private database: DatabaseService,
    private accountService: AccountService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.database.init();
      await this.load();
    } catch (e) {
      this.error = e instanceof Error ? e.message : this.translate.instant('COMMON.ERROR');
      this.loading = false;
    }
    this.cdr.detectChanges();
  }

  ionViewWillEnter(): void {
    if (this.database.isOpen()) {
      this.load();
    }
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    try {
      await this.accountService.recalculateAllBalances();
      this.accounts = await this.accountService.getAll();
    } catch (e) {
      this.error = e instanceof Error ? e.message : this.translate.instant('COMMON.ERROR');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  formatMoney(amount: number | undefined, currencyCode: string): string {
    return formatCurrency(amount ?? 0, currencyCode, this.locale);
  }

  goToNew(): void {
    this.router.navigate(['/accounts', 'new']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/accounts', id]);
  }
}
