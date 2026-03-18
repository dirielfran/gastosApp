import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { DatabaseService } from '../core/database';
import { AccountService, MovementService, CategoryService } from '../core/services';
import { TranslateService } from '@ngx-translate/core';
import type { Account } from '../core/models/account.model';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.page.html',
  styleUrls: ['./transfer.page.scss'],
  standalone: false,
})
export class TransferPage implements OnInit {
  fromAccountId: number | null = null;
  toAccountId: number | null = null;
  amount: number | null = null;
  note = '';
  transferDate: string = new Date().toISOString().slice(0, 10);
  accounts: Account[] = [];
  saving = false;
  private transferCategoryId: number | null = null;

  constructor(
    private database: DatabaseService,
    private accountService: AccountService,
    private movementService: MovementService,
    private categoryService: CategoryService,
    private translate: TranslateService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.database.init();
    this.accounts = await this.accountService.getAll();
    if (this.accounts.length >= 2) {
      this.fromAccountId = this.accounts[0].id;
      this.toAccountId = this.accounts[1].id;
    }
    const cats = await this.categoryService.getAll();
    const other = cats.find((c) => c.nameKey === 'CATEGORIES.OTHER');
    this.transferCategoryId = other?.id ?? (cats.length > 0 ? cats[0].id : null);
  }

  get canSave(): boolean {
    return (
      this.fromAccountId != null &&
      this.toAccountId != null &&
      this.fromAccountId !== this.toAccountId &&
      this.amount != null &&
      this.amount > 0
    );
  }

  async save(): Promise<void> {
    if (!this.canSave || this.transferCategoryId == null) return;
    this.saving = true;
    try {
      const noteText = `[${this.translate.instant('TRANSFER.TAG')}] ${this.note}`.trim();
      await this.movementService.create({
        accountId: this.fromAccountId!,
        categoryId: this.transferCategoryId,
        type: 'expense',
        amount: this.amount!,
        note: noteText,
        movementDate: this.transferDate,
        photoUri: null,
      });
      await this.movementService.create({
        accountId: this.toAccountId!,
        categoryId: this.transferCategoryId,
        type: 'income',
        amount: this.amount!,
        note: noteText,
        movementDate: this.transferDate,
        photoUri: null,
      });
      const toast = await this.toastCtrl.create({
        message: this.translate.instant('TRANSFER.SUCCESS'),
        duration: 2000,
        color: 'success',
        position: 'bottom',
      });
      await toast.present();
      this.router.navigate(['/tabs/explore']);
    } finally {
      this.saving = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/tabs/explore']);
  }
}
