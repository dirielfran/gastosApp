import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { DatabaseService } from '../core/database';
import { AccountService, BudgetAlertService, CategoryService, MovementService } from '../core/services';
import { TranslateService } from '@ngx-translate/core';
import type { MovementType } from '../core/models/movement.model';
import type { Account } from '../core/models/account.model';
import type { Category } from '../core/models/category.model';

@Component({
  selector: 'app-movement',
  templateUrl: './movement.page.html',
  styleUrls: ['./movement.page.scss'],
  standalone: false,
})
export class MovementPage implements OnInit {
  id: number | null = null;
  accountId: number | null = null;
  categoryId: number | null = null;
  type: MovementType = 'expense';
  amount: number | null = null;
  note = '';
  movementDate: string = new Date().toISOString().slice(0, 10);
  accounts: Account[] = [];
  categories: Category[] = [];
  saving = false;

  constructor(
    private database: DatabaseService,
    private movementService: MovementService,
    private accountService: AccountService,
    private categoryService: CategoryService,
    private budgetAlertService: BudgetAlertService,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.database.init();
    this.accounts = await this.accountService.getAll();
    this.categories = await this.categoryService.getAll();
    if (this.accounts.length > 0 && !this.accountId) this.accountId = this.accounts[0].id;
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.id = +idParam;
      const mov = await this.movementService.getById(this.id);
      if (mov) {
        this.accountId = mov.accountId;
        this.categoryId = mov.categoryId;
        this.type = mov.type;
        this.amount = mov.amount;
        this.note = mov.note ?? '';
        this.movementDate = mov.movementDate;
      }
    } else if (this.categories.length > 0 && !this.categoryId) {
      this.categoryId = this.categories[0].id;
    }
  }

  getCategoryName(c: Category): string {
    if (c.nameCustom) return c.nameCustom;
    if (c.nameKey) return this.translate.instant(c.nameKey);
    return '—';
  }

  async save(): Promise<void> {
    if (
      this.accountId == null ||
      this.categoryId == null ||
      this.amount == null ||
      this.amount <= 0
    )
      return;
    this.saving = true;
    try {
      if (this.id != null) {
        await this.movementService.update(this.id, {
          accountId: this.accountId,
          categoryId: this.categoryId,
          type: this.type,
          amount: this.amount,
          note: this.note.trim() || null,
          movementDate: this.movementDate,
        });
      } else {
        await this.movementService.create({
          accountId: this.accountId,
          categoryId: this.categoryId,
          type: this.type,
          amount: this.amount,
          note: this.note.trim() || null,
          movementDate: this.movementDate,
          photoUri: null,
        });
      }
      await this.accountService.recalculateBalance(this.accountId);
      if (this.type === 'expense' && this.categoryId != null) {
        await this.budgetAlertService.checkAlertsAfterMovement(
          this.categoryId,
          this.movementDate
        );
      }
      this.router.navigate(['/tabs/explore']);
    } catch {
      const toast = await this.toastCtrl.create({
        message: this.translate.instant('COMMON.SAVE_ERROR'),
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
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
    try {
      const mov = await this.movementService.getById(this.id);
      await this.movementService.delete(this.id);
      if (mov) {
        await this.accountService.recalculateBalance(mov.accountId);
      }
      this.router.navigate(['/tabs/explore']);
    } catch {
      const toast = await this.toastCtrl.create({
        message: this.translate.instant('COMMON.DELETE_ERROR'),
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  cancel(): void {
    this.router.navigate(['/tabs/explore']);
  }
}
