import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Señal para que la página Explorar recargue la lista de movimientos
 * cuando la URL es /tabs/explore (p. ej. tras guardar o eliminar un movimiento).
 */
@Injectable({
  providedIn: 'root',
})
export class ExploreRefreshService {
  private readonly refresh$ = new Subject<void>();

  /** Emite cuando la lista de Explorar debe recargarse. */
  get onRefreshRequested() {
    return this.refresh$.asObservable();
  }

  /** Dispara una recarga de la lista (llamado al navegar a /tabs/explore). */
  requestRefresh(): void {
    this.refresh$.next();
  }
}
