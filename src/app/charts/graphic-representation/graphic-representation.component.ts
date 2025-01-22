import { Component } from '@angular/core';

@Component({
  selector: 'app-graphic-representation',
  templateUrl: './graphic-representation.component.html',
  styleUrl: './graphic-representation.component.scss'
})
export class GraphicRepresentationComponent {
  charType: string = '1';
  
  selectedTab: string = 'individual'; // Tab seleccionado por defecto
  
  onCharTypeChange(newCharType: string): void {
    this.charType = newCharType; // Actualiza el charType con el nuevo valor
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }
}
