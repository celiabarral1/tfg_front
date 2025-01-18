import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-card',
  templateUrl: './custom-card.component.html',
  styleUrls: ['./custom-card.component.scss']
})
export class CustomCardComponent {
  @Input() title?: string;
  @Input() icon?: string; // Poner uno x defecto
  @Input() imageUrl?: string;
  @Input() description?: string;
  @Input() iconClass?: string;
  @Input() route: string = '/'; 
}
