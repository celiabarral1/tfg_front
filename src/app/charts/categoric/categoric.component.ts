import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChartDataService } from '../../shared/shared/chart-data.service';
import { IndividualService } from '../../individual/individual.service';
import { DateHelper } from '../../@core/common/utils/date-helper';
import { Chart, registerables } from 'chart.js';
import { EmotionTranslationService } from '../../shared/shared/emotions-translate.service';

@Component({
  selector: 'app-categoric',
  templateUrl: './categoric.component.html',
  styleUrls: ['./categoric.component.scss']
})

/**
 * Componente ecncargado de realizar la representación gráfica de las emociones categóricas
 */
export class CategoricComponent implements OnInit , OnDestroy{
  /**
   * Referencia al elemento del DOM que representa el linezo, canvas, 
   * de un gráfico lineal
   */
  @ViewChild('canvasCategoric', { static: true }) canvasCategoric!: ElementRef<HTMLDivElement>;
  /**
   * Referencia al elemento del DOM que representa el linezo, canvas, 
   * de un gráfico acumulado
   */
  @ViewChild('canvasAccumulated', { static: true }) canvasAccumulated!: ElementRef<HTMLDivElement>;
  public chart: any;
  public graphData: any[] = [];
  public userId: any;
  public timePeriod: any;
  public emotions: any[] = [];
  public accumulatedChart: any; 

  /**
   * Constructor del componente
   * @param chartDataService , servicio al que se suscribe para recibir datos a mostrar
   * @param service servicio para 
   * @param translateService 
   */
  constructor(private chartDataService: ChartDataService,private readonly service: IndividualService ,
    private translateService: EmotionTranslationService
  ) {
    Chart.register(...registerables);
    if (typeof window !== 'undefined') {
      import('chartjs-plugin-zoom').then((zoomPlugin) => {
        Chart.register(zoomPlugin.default);
      });
    } 
  }

  /**
   * Destruye los gráficos creados al cerrar la vista. Borra los datos dels ervicio CharData.
   */
  ngOnDestroy(): void {
    this.destroyChart(this.chart);
    this.destroyChart(this.accumulatedChart);
    this.chartDataService.deleteChartData();
  }

  /**
   * Realiza una petición al servidor para obtener las emociones que va a representar.
   * Las filtra y los datos que contiene chartDataService al que el componente está suscrito,
   * pasan a ser los datos del componente
   */
  ngOnInit(): void {
    this.service.getEmotions().subscribe(
      (response) => {
        const orderedEmotions = ['happiness', 'neutral', 'anger', 'disgust', 'fear', 'sadness'];
        this.emotions = orderedEmotions.filter(e => response.includes(e));
      },
      (error) => {
        console.error('Error al obtener las emociones:', error);
      }
    );

    this.chartDataService.chartData$.subscribe(charData => {
      this.graphData = charData.data;
      this.userId = charData.userId;
      this.timePeriod = charData.time;
      this.createChart(); 
      this.createAccumulatedStudyChart();
    });
  }

  public destroyChart(chart: any): void {
    if (chart) {
      chart.destroy();
      chart = null;
    }
  }
  


  /**
   * Crea el gráfico de tipo línea, que representa el cambio de emoción predominante a lo largo del tiempo
   */
  createChart(): void {
    this.destroyChart(this.chart);
    // Crear y adjuntar un nuevo canvas dinámicamente
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas_categoric';
    this.canvasCategoric.nativeElement.innerHTML = ''; // Limpia el contenedor
    this.canvasCategoric.nativeElement.appendChild(canvas);

      // Configura las etiquetas del eje X
      const labels = this.graphData.map(item => {
        const date = new Date(item.timestamp * 1000); // Convertir timestamp a fecha
        return date.toLocaleDateString(); // Usa el formato que prefieras
      });
  
      // Recorro cada item (Record) de graphData, saco sus emotions labels ['joy','anger','sadness']
      let data = this.graphData.map((item) => {
        const emotionLabels = [item.Emotion_1_label,item.Emotion_2_label,item.Emotion_3_label];
      
        // Busca el índice de cada emoción en `this.emotions`.
        // Trabajamos con los índicies del array de this.emotions, cada emoción se 
        // encuentra en una posición
        return emotionLabels.map((label) => {
          const emotionIndex = this.emotions.findIndex((emotion) => emotion === label);
          return emotionIndex !== -1 ? emotionIndex : null; // Índice o null si no existe
        });
      });

      this.chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Emociones',
              data: data,
              stepped: true,
              borderColor: '#6150EA', // Color de la línea
              borderWidth: 2,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const rawData = context.raw as number[];
                  if (Array.isArray(rawData) && rawData.length > 1) {
                    const index = rawData[1]; 

                    if (index >= 0 && index < this.emotions.length) {
                      return `Emoción: ${this.translateService.translateEmotion(this.emotions[index])}`;
                    }
                  }

                  return 'Emoción: Desconocido'; 
                }
              }
            },
            zoom: {
              zoom: {
                wheel: { enabled: true },
                pinch: { enabled: true },
                mode: 'x'  // Habilita zoom
              },
              pan: {
                enabled: true, 
                mode: 'xy' // Hbilita desplazamiento
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Tiempo' }
            },
            y: {
              title: { display: true, text: 'Emociones' },
              ticks: {
                callback: (tickValue: string | number) => {
                  // EJE X: Solo las etiquetas de string, las emociones
                  const index = typeof tickValue === 'number' ? tickValue : parseInt(tickValue, 10);
                  return this.emotions[index] !== undefined ? this.emotions[index] : '';
                }
              },
              beginAtZero: true,
              max: this.emotions.length - 1 + 1   // Asegura que las emociones estén dentro del rango
            }
          }
        }
      });
    }

    /**
     * A partir de los datos de base, se crea un gráfico que representa las apariciones acumuladas de cada emoción
     */
    createAccumulatedStudyChart(): void {
      // Destruir el gráfico previo si existe
      this.destroyChart(this.accumulatedChart);

      // Crear y adjuntar un nuevo canvas dinámicamente
      const canvas = document.createElement('canvas');
      canvas.id = 'canvas_accumulated';
      this.canvasAccumulated.nativeElement.innerHTML = ''; // Limpia el contenedor
      this.canvasAccumulated.nativeElement.appendChild(canvas);
      
        // Calcular los datos acumulados
        const accumulatedData = this.emotions.map(emotion => {
          return this.graphData.reduce((acc, item) => {
            const emotionLabels = [item.Emotion_1_label, item.Emotion_2_label, item.Emotion_3_label];
            return acc + emotionLabels.filter(label => label === emotion).length;
          }, 0);
        });
      
        const labels = this.emotions; // Emociones como etiquetas del eje X
        const data = accumulatedData; // Frecuencias acumuladas de cada emoción
      
        // Definir los colores para cada emoción
        const emotionColors: { [key: string]: string } = {
          joy: '#FFEB3B', 
          sadness: '#A2C2E1',  
          anger: '#FF7F7F',  
          fear: '#A8D5BA',  
          disgust: '#877459',  
          neutral: '#FFF8E7'
        };
      
        // Crear un array de colores para cada barra según la emoción
        const backgroundColors = this.emotions.map(emotion => emotionColors[emotion.toLowerCase()] || '#FF6384'); 
    
        // Crear el gráfico en el nuevo canvas
        this.accumulatedChart = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Frecuencia Acumulada de Emociones',
                data: data,
                backgroundColor: backgroundColors,  // Asignar colores a cada barra
                borderColor: backgroundColors,  // Usar los mismos colores para el borde
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              x: {
                title: { display: true, text: 'Emociones' }
              },
              y: {
                title: { display: true, text: 'Frecuencia' },
                beginAtZero: true
              }
            }
          }
        });
      }
    
}