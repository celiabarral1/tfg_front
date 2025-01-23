import { ChangeDetectorRef, Component } from '@angular/core';
import { ChartDataService } from '../../shared/shared/chart-data.service';

@Component({
  selector: 'app-graphic-representation',
  templateUrl: './graphic-representation.component.html',
  styleUrl: './graphic-representation.component.scss'
})
export class GraphicRepresentationComponent {
  charType: string = '1';
  
  selectedTab: string = 'individual'; // Tab seleccionado por defecto

  constructor(private chartDataService: ChartDataService, private cdr: ChangeDetectorRef) {
    
  }
  
  onCharTypeChange(newCharType: string): void {
    this.charType = newCharType; // Actualiza el charType con el nuevo valor
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
    this.resetCharType(); // Resetea el tipo de gráfico al cambiar de pestaña
    this.chartDataService.deleteChartData();
    this.cdr.detectChanges(); 
  }

  private resetCharType(): void {
    this.charType = '1'; // Valor predeterminado al cambiar de pestaña
  }

  scrollToGraphic(): void {
    const element = document.getElementById('graphic-representation');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
