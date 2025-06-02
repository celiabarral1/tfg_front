import { Component } from '@angular/core';

/**
 * Componente para la representación emocional individual de un trabajador.
 */
@Component({
  selector: 'app-individual',
  templateUrl: './individual.component.html',
  styleUrl: './individual.component.scss'
})
export class IndividualComponent {
  charType: string = '1';
  
  onCharTypeChange(newCharType: string): void {
    this.charType = newCharType; // Actualiza el charType con el nuevo valor
  }
}
