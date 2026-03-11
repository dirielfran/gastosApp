import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
  standalone: false,
})
export class MorePage {
  constructor(private router: Router) {}

  goTo(path: string): void {
    this.router.navigate([`/${path}`]);
  }
}
