import { Component } from '@angular/core';

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
