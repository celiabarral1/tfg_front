import { Component, Input, OnInit } from '@angular/core';
import { AnalysisService } from './analysis.service';
import { Classification } from './model/classification';
import { Router } from '@angular/router';

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
   * Constructor del componente de análisis de grupos.
   * @param analysisService servicio para realizar peticiones y obtener datos a la API sobre la clasificación de trabajadores
   * por tendecia psicológica.
   * @param router servicio que gestiona la navegación entre pantallas
   */
  constructor (private readonly analysisService: AnalysisService, private router: Router){}

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
          },
          error: (error) => {
            console.error('Error al obtener la clasificación:', error);
          }
        });
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

}
