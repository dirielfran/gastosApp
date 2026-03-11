import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../core/database';
import { AccountService } from '../core/services';
import type { AccountCreate } from '../core/models/account.model';

const CURRENCIES = ['EUR', 'USD', 'GBP', 'COP', 'BRL', 'MXN', 'ARS', 'CLP'];

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.page.html',
  styleUrls: ['./account-form.page.scss'],
  standalone: false,
})
export class AccountFormPage implements OnInit {
  id: number | null = null;
  name = '';
  currencyCode = 'EUR';
  currencies = CURRENCIES;
  saving = false;

  constructor(
    private database: DatabaseService,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.database.init();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.id = +idParam;
      const acc = await this.accountService.getById(this.id);
      if (acc) {
        this.name = acc.name;
        this.currencyCode = acc.currencyCode;
      }
    }
  }

  async save(): Promise<void> {
    if (!this.name.trim()) return;
    this.saving = true;
    try {
      if (this.id != null) {
        await this.accountService.update(this.id, {
          name: this.name.trim(),
          currencyCode: this.currencyCode,
        });
      } else {
        await this.accountService.create({
          name: this.name.trim(),
          currencyCode: this.currencyCode,
          isActive: 1,
        });
      }
      this.router.navigate(['/accounts']);
    } finally {
      this.saving = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/accounts']);
  }
}
