import { Component } from '@angular/core';

/**
 * Componente que representa la página principal, de navegación.
 */
@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.scss'
})
export class PrincipalComponent {
  scrollToCards(): void {
    const element = document.getElementById('card-container');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
