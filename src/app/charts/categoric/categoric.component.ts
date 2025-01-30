import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChartDataService } from '../../shared/shared/chart-data.service';
import { IndividualService } from '../../individual/individual.service';
import { DateHelper } from '../../@core/common/utils/date-helper';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-categoric',
  templateUrl: './categoric.component.html',
  styleUrls: ['./categoric.component.scss']
})
export class CategoricComponent implements OnInit , OnDestroy{
  @ViewChild('canvasCategoric', { static: true }) canvasCategoric!: ElementRef<HTMLDivElement>;
  @ViewChild('canvasAccumulated', { static: true }) canvasAccumulated!: ElementRef<HTMLDivElement>;
  public chart: any;
  public graphData: any[] = [];
  public userId: any;
  public timePeriod: any;
  public emotions: any[] = [];
  public accumulatedChart: any; 

  constructor(private chartDataService: ChartDataService,private readonly service: IndividualService) {
    Chart.register(...registerables);
    if (typeof window !== 'undefined') {
      import('chartjs-plugin-zoom').then((zoomPlugin) => {
        Chart.register(zoomPlugin.default);
      });
    } 
  }
  ngOnDestroy(): void {
    this.destroyChart(this.chart);
    this.destroyChart(this.accumulatedChart);
    this.chartDataService.deleteChartData();
  }

  ngOnInit(): void {
    this.service.getEmotions().subscribe(
      (response) => {
        this.emotions = response; 
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
              label: 'Emotions',
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
            zoom: {
              zoom: {
                wheel: { enabled: true },
                pinch: { enabled: true },
                mode: 'x'
              },
              pan: {
                enabled: true, 
                mode: 'xy' // Falta limitar desplazamiento y
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Time' }
            },
            y: {
              title: { display: true, text: 'Emotions' },
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
        joy: '#FFEB3B',  // Amarillo pastel
        sadness: '#A2C2E1',  // Azul pastel
        anger: '#FF7F7F',  // Rojo pastel
        fear: '#A8D5BA',  // Verde pastel
        disgust: '#877459',  // Verde amarronado
        neutral: '#FFF8E7'  // Beige
      };
    
      // Crear un array de colores para cada barra según la emoción
      const backgroundColors = this.emotions.map(emotion => emotionColors[emotion.toLowerCase()] || '#FF6384'); // Color por defecto si no se encuentra la emoción
    
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
              title: { display: true, text: 'Emotions' }
            },
            y: {
              title: { display: true, text: 'Frequency' },
              beginAtZero: true
            }
          }
        }
      });
    }
    
}