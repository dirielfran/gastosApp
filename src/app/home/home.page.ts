import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../core/database';
import { MovementService } from '../core/services';
import { SettingsService } from '../core/services';
import { formatCurrency } from '../core/utils';
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
  dateFrom = '';
  dateTo = '';
  loading = true;
  locale = 'es';
  currencyCode = 'EUR';

  constructor(
    private database: DatabaseService,
    private movementService: MovementService,
    private settings: SettingsService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.database.init();
    this.locale = await this.settings.getSetting(this.settings.keys.LANGUAGE, 'es');
    await this.loadThisMonthBalance();
  }

  ionViewWillEnter(): void {
    if (this.database.isOpen()) {
      this.loadThisMonthBalance();
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

  async loadThisMonthBalance(): Promise<void> {
    this.loading = true;
    try {
      const { from, to } = this.getThisMonthRange();
      this.dateFrom = from;
      this.dateTo = to;
      const totals = await this.movementService.getTotalsByType(from, to);
      this.income = totals.income;
      this.expense = totals.expense;
      this.balance = totals.income - totals.expense;
    } finally {
      this.loading = false;
    }
  }

  formatMoney(amount: number): string {
    return formatCurrency(amount, this.currencyCode, this.locale);
  }
}
