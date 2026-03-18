import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DatabaseService } from '../core/database';
import { RecurringService, AccountService, CategoryService } from '../core/services';
import { TranslateService } from '@ngx-translate/core';
import type { Account } from '../core/models/account.model';
import type { Category } from '../core/models/category.model';
import type { RecurringFrequency } from '../core/models/recurring.model';

@Component({
  selector: 'app-recurring-form',
  templateUrl: './recurring-form.page.html',
  styleUrls: ['./recurring-form.page.scss'],
  standalone: false,
})
export class RecurringFormPage implements OnInit {
  id: number | null = null;
  accountId: number | null = null;
  categoryId: number | null = null;
  type: 'expense' | 'income' = 'expense';
  amount: number | null = null;
  note = '';
  frequency: RecurringFrequency = 'monthly';
  dayOfMonth = 1;
  accounts: Account[] = [];
  categories: Category[] = [];
  saving = false;

  constructor(
    private database: DatabaseService,
    private recurringService: RecurringService,
    private accountService: AccountService,
    private categoryService: CategoryService,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.database.init();
    this.accounts = await this.accountService.getAll();
    this.categories = await this.categoryService.getAll();
    if (this.accounts.length > 0 && !this.accountId) this.accountId = this.accounts[0].id;
    if (this.categories.length > 0 && !this.categoryId) this.categoryId = this.categories[0].id;

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.id = +idParam;
      const rec = await this.recurringService.getById(this.id);
      if (rec) {
        this.accountId = rec.accountId;
        this.categoryId = rec.categoryId;
        this.type = rec.type;
        this.amount = rec.amount;
        this.note = rec.note ?? '';
        this.frequency = rec.frequency;
        this.dayOfMonth = rec.dayOfMonth;
      }
    }
  }

  getCategoryName(c: Category): string {
    if (c.nameCustom) return c.nameCustom;
    if (c.nameKey) return this.translate.instant(c.nameKey);
    return '—';
  }

  async save(): Promise<void> {
    if (this.accountId == null || this.categoryId == null || !this.amount || this.amount <= 0) return;
    this.saving = true;
    try {
      if (this.id != null) {
        await this.recurringService.update(this.id, {
          accountId: this.accountId,
          categoryId: this.categoryId,
          type: this.type,
          amount: this.amount,
          note: this.note.trim() || null,
          frequency: this.frequency,
          dayOfMonth: this.dayOfMonth,
        });
      } else {
        await this.recurringService.create({
          accountId: this.accountId,
          categoryId: this.categoryId,
          type: this.type,
          amount: this.amount,
          note: this.note.trim() || null,
          frequency: this.frequency,
          dayOfMonth: this.dayOfMonth,
          isActive: 1,
        });
      }
      this.router.navigate(['/recurring']);
    } finally {
      this.saving = false;
    }
  }

  async confirmDelete(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('COMMON.CONFIRM_DELETE_TITLE'),
      message: this.translate.instant('COMMON.CONFIRM_DELETE_MSG'),
      buttons: [
        { text: this.translate.instant('COMMON.CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('COMMON.DELETE'),
          role: 'destructive',
          handler: () => this.doDelete(),
        },
      ],
    });
    await alert.present();
  }

  private async doDelete(): Promise<void> {
    if (this.id == null) return;
    await this.recurringService.delete(this.id);
    this.router.navigate(['/recurring']);
  }

  cancel(): void {
    this.router.navigate(['/recurring']);
  }
}
