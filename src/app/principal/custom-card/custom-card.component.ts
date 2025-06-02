import { Component, Input } from '@angular/core';

/**
 * Componente visual para las tajetas de inicio.
 */
@Component({
  selector: 'app-custom-card',
  templateUrl: './custom-card.component.html',
  styleUrls: ['./custom-card.component.scss']
})
export class CustomCardComponent {
  @Input() title?: string;
  @Input() icon?: string; 
  @Input() iconName?: string;
  @Input() description?: string;
  @Input() iconClass?: string;
  @Input() route: string = '/'; 
}
