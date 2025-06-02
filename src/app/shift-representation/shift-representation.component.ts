import { Component } from '@angular/core';

/**
 * Componente para la representación emocional de trabajadores por turno
 */
@Component({
  selector: 'app-shift-representation',
  templateUrl: './shift-representation.component.html',
  styleUrl: './shift-representation.component.scss'
})
export class ShiftRepresentationComponent {
  charType: string = '1';
  
  onCharTypeChange(newCharType: string): void {
    this.charType = newCharType; 
  }
}
