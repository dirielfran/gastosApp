import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from './settings.service';
import { ThemeMode } from '../models/settings.model';

const DARK_CLASS = 'ion-palette-dark';

/**
 * Servicio de tema claro/oscuro.
 * Aplica la clase de Ionic para modo oscuro y persiste la preferencia en SettingsService.
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly isBrowser: boolean;
  private mediaQuery: MediaQueryList | null = null;
  private mediaListener: (() => void) | null = null;

  /** Emite el modo actual efectivo: 'light' | 'dark'. */
  readonly effectiveMode$ = new BehaviorSubject<'light' | 'dark'>('light');

  constructor(
    private settings: SettingsService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Inicializa el tema: lee la preferencia guardada y aplica.
   * Debe llamarse tras tener la BD/settings disponibles (p. ej. en AppComponent tras init).
   */
  async init(): Promise<void> {
    if (!this.isBrowser) return;
    const saved = await this.settings.getSetting(
      this.settings.keys.THEME,
      'system'
    );
    const mode = (saved === 'light' || saved === 'dark' || saved === 'system'
      ? saved
      : 'system') as ThemeMode;
    await this.applyMode(mode);
    this.watchSystemPreference();
  }

  /**
   * Obtiene el modo guardado (light | dark | system).
   */
  async getTheme(): Promise<ThemeMode> {
    const v = await this.settings.getSetting(this.settings.keys.THEME, 'system');
    return (v === 'light' || v === 'dark' || v === 'system' ? v : 'system') as ThemeMode;
  }

  /**
   * Establece el tema y lo persiste.
   */
  async setTheme(mode: ThemeMode): Promise<void> {
    await this.settings.setSetting(this.settings.keys.THEME, mode);
    await this.applyMode(mode);
  }

  /**
   * Aplica el modo: si es 'system', usa prefers-color-scheme; si no, aplica light o dark.
   */
  private async applyMode(mode: ThemeMode): Promise<void> {
    if (!this.isBrowser) return;
    const dark =
      mode === 'dark' ||
      (mode === 'system' && this.getSystemPrefersDark());
    this.applyDark(dark);
    this.effectiveMode$.next(dark ? 'dark' : 'light');
  }

  private getSystemPrefersDark(): boolean {
    if (!this.isBrowser || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyDark(dark: boolean): void {
    if (!this.isBrowser) return;
    const el = document.documentElement;
    if (dark) {
      el.classList.add(DARK_CLASS);
      document.body?.classList.add(DARK_CLASS);
    } else {
      el.classList.remove(DARK_CLASS);
      document.body?.classList.remove(DARK_CLASS);
    }
  }

  /** Escucha cambios en la preferencia del sistema cuando el modo es 'system'. */
  private watchSystemPreference(): void {
    if (!this.isBrowser || !window.matchMedia) return;
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaListener = async () => {
      const mode = await this.getTheme();
      if (mode === 'system') await this.applyMode('system');
    };
    this.mediaQuery.addEventListener('change', this.mediaListener);
  }

  /** Elimina el listener (llamar si el servicio se destruye). */
  destroy(): void {
    if (this.mediaQuery && this.mediaListener) {
      this.mediaQuery.removeEventListener('change', this.mediaListener);
      this.mediaQuery = null;
      this.mediaListener = null;
    }
  }
}
