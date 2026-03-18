import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ExportService } from '../core/services';

@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
  standalone: false,
})
export class MorePage {
  constructor(
    private router: Router,
    private exportService: ExportService
  ) {}

  goTo(path: string): void {
    this.router.navigate([`/${path}`]);
  }

  async exportData(): Promise<void> {
    await this.exportService.exportMovementsCsv();
  }
}
