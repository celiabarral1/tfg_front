import { Component } from '@angular/core';

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
