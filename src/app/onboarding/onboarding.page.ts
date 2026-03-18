import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '../core/services';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: false,
})
export class OnboardingPage {
  currentSlide = 0;

  constructor(
    private settings: SettingsService,
    private router: Router
  ) {}

  async finish(): Promise<void> {
    await this.settings.setSetting('onboarding_completed', 'true');
    this.router.navigate(['/tabs/home'], { replaceUrl: true });
  }
}
