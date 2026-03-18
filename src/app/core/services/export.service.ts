import { Injectable } from '@angular/core';
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

    const header = 'Date,Type,Category,Account,Amount,Note';
    const rows = movements.map((m) => {
      const cat = catMap.get(m.categoryId) ?? '';
      const acc = accMap.get(m.accountId) ?? '';
      const note = (m.note ?? '').replace(/"/g, '""');
      return `${m.movementDate},${m.type},"${cat}","${acc}",${m.amount},"${note}"`;
    });

    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
