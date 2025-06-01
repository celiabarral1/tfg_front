import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AnalysisService } from './analysis.service';
import { Classification } from './model/classification';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';

/**
 * Componente destinado a la visualización de los trabajadores agrupados según su tendencia psicológica predominante.
 */
@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.scss'
})
export class AnalysisComponent implements OnInit {

  /**
   * Estructura de datos que almacena la clasificación de los trabajadores.
   */
  @Input() classificationData = new Classification();

  /**
   * Propiedad para poder realizar una búsqueda por id del trabajador.
   * Se actualiza al escribir.
   */
  searchTerm: string = ''; 

  /**
   * Las siguientes tres propiedas se utilizan para gestionar la apariencia de un botón de "Leer más".
   * Con ellos se evita que si un grupo es demasiado extenso, sea más fácil de manejar.
   */
  showMoreDepression: boolean = false;
  showMoreAnxiety: boolean = false;
  showMoreNoDisorder: boolean = false;
  
  /**
   * Las siguientes tres propiedas se utilizan para gestionar la apariencia de un botón de "Leer menos".
   * Si el grupo s eha extendido y se quiere recudir, sea más fácil de manejar.
   */
  showLessDepression: boolean = true;
  showLessAnxiety: boolean = true;
  showLessNoDisorder: boolean = true;


  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: any;

  /**
   * Constructor del componente de análisis de grupos.
   * @param analysisService servicio para realizar peticiones y obtener datos a la API sobre la clasificación de trabajadores
   * por tendecia psicológica.
   * @param router servicio que gestiona la navegación entre pantallas
   */
  constructor (private readonly analysisService: AnalysisService, private router: Router){
    Chart.register(...registerables); 
    
  }

  /**
   * Inicializa al componente realizando una petición de la que se recogen los datos a mostar, la clasificación
   * @throws {Error} si no se puede realizar la petición con éxito
   */
   ngOnInit(): void {
    if(this.classificationData.depression.length===0 && this.classificationData.anxiety.length===0 &&
      this.classificationData.no_disorder.length===0) {
        this.analysisService.getClassification().subscribe({
          next: (response) => {
            this.classificationData = new Classification(
              response.no_disorder,
              response.depression,
              response.anxiety
            ); 
            setTimeout(() => {
          this.createChart();  // Retrasamos la creación del gráfico
        }, 100); 
          },
          error: (error) => {
            console.error('Error al obtener la clasificación:', error);
          }
        });
      } else {
        setTimeout(() => {
          this.createChart();  // Retrasamos la creación del gráfico
        }, 0); 
      }
    
      
  }
  
  /**
   * Método que permite la navegación hacia a vista de Representación pasándole
   * un identificador de trabajador.
   * @param id identificador de un trabajador
   */
  routeToRepresentation(id: number): void {
    this.router.navigate(['/representation', id]);
  }

  /**
   * Filtra según el criterio de búsqueda los trabajadores con tendencia depresiva 
   * por coincidencia con su identificador.
   */
  get filteredDepression(): number[] {
    return this.classificationData.depression.filter((id) =>
      id.toString().includes(this.searchTerm)
    );
  }
  
   /**
   * Filtra según el criterio de búsqueda los trabajadores con tendencia ansiosa 
   * por coincidencia con su identificador.
   */
  get filteredAnxiety(): number[] {
    return this.classificationData.anxiety.filter((id) =>
      id.toString().includes(this.searchTerm)
    );
  }
  
   /**
   * Filtra según el criterio de búsqueda los trabajadores sin tendencias llamativas
   * por coincidencia con su identificador.
   */
  get filteredNoDisorder(): number[] {
    return this.classificationData.no_disorder.filter((id) =>
      id.toString().includes(this.searchTerm)
    );
  }
  
  /**
   * Método para manejar si se deben ocultar algunos ids por exceso de datos y mostrar
   * un "Leer más"
   */
  showMore(group: string): void {
    if (group === 'depression') {
      this.showMoreDepression = true;
    } else if (group === 'anxiety') {
      this.showMoreAnxiety = true;
    } else if (group === 'noDisorder') {
      this.showMoreNoDisorder = true;
    }
  }

  /**
   * Método para manejar si se deben mostrar todos los ids o solo los primeros
   */
  toggleShow(group: string): void {
    if (group === 'depression') {
      this.showLessDepression = !this.showLessDepression;
    } else if (group === 'anxiety') {
      this.showLessAnxiety = !this.showLessAnxiety;
    } else if (group === 'noDisorder') {
      this.showLessNoDisorder = !this.showLessNoDisorder;
    }
  }


createChart(): void {
  if (!this.chartCanvas) return;

  const ctx = this.chartCanvas.nativeElement.getContext('2d');
  if (!ctx) return;

  if (this.chart) {
    this.chart.destroy(); // elimina gráfico anterior si existe
  }

  this.chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Depresión', 'Ansiedad', 'Sin Trastorno'],
      datasets: [{
        label: 'Distribución de trabajadores',
        data: [
          this.classificationData.depression.length,
          this.classificationData.anxiety.length,
          this.classificationData.no_disorder.length
        ],
        backgroundColor: ['#c9caf5', '#f5ebc9', '#8F8F8F'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Distribución de trabajadores por tendencia psicológica'
        }
      }
    }
  });
}

}