import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { BudgetService } from './budget.service';
import { SettingsService } from './settings.service';

const ALERTED_KEY_PREFIX = 'budget_alerted_';

/**
 * Comprueba si debe mostrarse aviso de presupuesto tras guardar un movimiento
 * y evita repetir el mismo aviso en el mismo mes.
 */
@Injectable({
  providedIn: 'root',
})
export class BudgetAlertService {
  constructor(
    private budgetService: BudgetService,
    private settings: SettingsService,
    private translate: TranslateService,
    private toastCtrl: ToastController
  ) {}

  /**
   * Tras guardar un gasto: si la categoría tiene presupuesto y el gasto del mes
   * alcanza o supera el % de aviso, muestra un toast (solo una vez por presupuesto por mes).
   */
  async cleanupOldAlertKeys(): Promise<void> {
    const now = new Date();
    const currentKey = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}`;
    try {
      const rows = await this.settings.getSetting('__all_alert_keys', '');
      if (!rows) return;
      const keys = rows.split(',').filter((k) => k.trim());
      const toKeep = keys.filter((k) => k.includes(currentKey));
      const toDelete = keys.filter((k) => !k.includes(currentKey));
      for (const k of toDelete) {
        await this.settings.setSetting(`${ALERTED_KEY_PREFIX}${k}`, '');
      }
      await this.settings.setSetting('__all_alert_keys', toKeep.join(','));
    } catch {
      // Ignore cleanup errors
    }
  }

  async checkAlertsAfterMovement(
    categoryId: number,
    movementDate: string
  ): Promise<void> {
    const enabled = await this.settings.getSetting(
      this.settings.keys.BUDGET_ALERTS_ENABLED,
      'true'
    );
    if (enabled === 'false') return;

    const budget = await this.budgetService.getByCategoryId(categoryId);
    if (!budget) return;

    const [year, month] = movementDate.slice(0, 7).split('-');
    const dateFrom = `${year}-${month}-01`;
    const lastDay = new Date(+year, +month, 0).getDate();
    const dateTo = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

    const spent = await this.budgetService.getSpentInCategory(
      categoryId,
      dateFrom,
      dateTo
    );
    const threshold =
      (budget.amountLimit * budget.alertThresholdPercent) / 100;
    if (spent < threshold) return;

    const key = `${ALERTED_KEY_PREFIX}${year}_${month}`;
    const already = await this.settings.getSetting(key, '');
    const ids = already ? already.split(',').map((s) => s.trim()) : [];
    if (ids.includes(String(budget.id))) return;

    const percent =
      budget.amountLimit > 0
        ? Math.round((spent / budget.amountLimit) * 100)
        : budget.alertThresholdPercent;
    const limitFormatted = budget.amountLimit.toFixed(2);
    const message = this.translate.instant('BUDGET_ALERTS.TOAST_MESSAGE', {
      percent,
      limit: limitFormatted,
    });

    const toast = await this.toastCtrl.create({
      message,
      duration: 4000,
      color: spent >= budget.amountLimit ? 'danger' : 'warning',
      position: 'bottom',
    });
    await toast.present();

    const newIds = [...ids, String(budget.id)];
    await this.settings.setSetting(key, newIds.join(','));

    const trackKey = '__all_alert_keys';
    const tracked = await this.settings.getSetting(trackKey, '');
    const monthKey = `${year}_${month}`;
    if (!tracked.includes(monthKey)) {
      await this.settings.setSetting(trackKey, tracked ? `${tracked},${monthKey}` : monthKey);
    }
  }
}
