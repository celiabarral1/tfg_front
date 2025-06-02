import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ChartDataService } from '../../shared/shared/chart-data.service';
import { CsvGestor } from '../../@core/common/utils/csv-gestor';
import { ActivatedRoute} from '@angular/router';
import { debounceTime, fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-graphic-representation',
  templateUrl: './graphic-representation.component.html',
  styleUrl: './graphic-representation.component.scss'
})

/**
 * Componente que gestiona todos los cambios de gráficos y los tipos de
 * visualización
 */
export class GraphicRepresentationComponent  implements OnInit {
  charType: string = '1';
  selectedTab: string = 'individual';
  graphData: any[] = [];
  id: string | null = null;
    resizeSubscription!: Subscription;

  constructor(private chartDataService: ChartDataService, private cdr: ChangeDetectorRef, private router: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.chartDataService.chartData$.subscribe((chartData) => {
      console.log(this.graphData)
      this.graphData = chartData.data || [];
      this.cdr.detectChanges(); 
    });
    this.id = this.router.snapshot.paramMap.get('id');
    console.log(this.id)
  }
  
  /**
   * Cambia el tipo de gráfico que se quiere visualizar.
   */
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
    this.charType = '1'; // Valor predeterminado. Gráfico dimensional
  }

  /**
   * 
   * @returns Descarga de datos 
   */
  downloadData(): void {
    if (this.isDisabled()) {
      console.warn('No hay datos disponibles para descargar.');
      return;
    }

    CsvGestor.downloadCsv(this.graphData,'data_emotions');
  }

  isDisabled(): boolean {
    return !this.graphData || this.graphData.length === 0;
  }


  scrollToGraphic(): void {
    const element = document.getElementById('graphic-representation');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }


}
