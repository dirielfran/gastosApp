import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { MovementService, MovementFilters } from './movement.service';
import { CategoryService } from './category.service';
import { AccountService } from './account.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(
    private movementService: MovementService,
    private categoryService: CategoryService,
    private accountService: AccountService,
    private translate: TranslateService
  ) {}

  async exportMovementsCsv(filters: MovementFilters = {}): Promise<void> {
    const movements = await this.movementService.getAll(filters);
    const categories = await this.categoryService.getAll();
    const accounts = await this.accountService.getAll();

    const catMap = new Map(categories.map((c) => [c.id, c.nameCustom || (c.nameKey ? this.translate.instant(c.nameKey) : '—')]));
    const accMap = new Map(accounts.map((a) => [a.id, a.name]));

    const header = [
      this.translate.instant('CSV.DATE'),
      this.translate.instant('CSV.TYPE'),
      this.translate.instant('CSV.CATEGORY'),
      this.translate.instant('CSV.ACCOUNT'),
      this.translate.instant('CSV.AMOUNT'),
      this.translate.instant('CSV.NOTE'),
    ].join(',');

    const rows = movements.map((m) => {
      const cat = catMap.get(m.categoryId) ?? '';
      const acc = accMap.get(m.accountId) ?? '';
      const note = (m.note ?? '').replace(/"/g, '""');
      return `${m.movementDate},${m.type},"${cat}","${acc}",${m.amount},"${note}"`;
    });

    const csv = [header, ...rows].join('\n');
    const filename = `gastos_${new Date().toISOString().slice(0, 10)}.csv`;
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });

    if (Capacitor.isNativePlatform() || this.canShareFiles()) {
      try {
        const file = new File([blob], filename, { type: 'text/csv' });
        await navigator.share({ files: [file], title: filename });
        return;
      } catch {
        // Fall through to DOM download
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private canShareFiles(): boolean {
    try {
      return typeof navigator.share === 'function' && typeof navigator.canShare === 'function';
    } catch {
      return false;
    }
  }
}
