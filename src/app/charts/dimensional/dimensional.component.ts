import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js'; // Importa 'registerables'
import { ChartDataService } from '../../shared/shared/chart-data.service';
import { EmotionTranslationService } from '../../shared/shared/emotions-translate.service';

@Component({
  selector: 'app-dimensional',
  templateUrl: './dimensional.component.html',
  styleUrls: ['./dimensional.component.scss'],
})
/**
 * Componente encargado de representar visualmente los datos dimensioanles que recibe
 */
export class DimensionalComponent implements OnInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef<HTMLDivElement>;
  private chart: Chart | null = null;
  public graphData: any[] = [];
  public userId: any;
  public timePeriod: any;

  constructor(private chartDataService: ChartDataService, private cdr: ChangeDetectorRef, private translateService: EmotionTranslationService) {
    Chart.register(...registerables);

    // Registro dinámico del plugin de zoom
    if (typeof window !== 'undefined') {
      import('chartjs-plugin-zoom').then((zoomPlugin) => {
        Chart.register(zoomPlugin.default);
      });
    }
  }

  /**
   * Estar suscrito a chartDataService le proporciona los datos y crea el gráfico
   */
  ngOnInit(): void {
    // Suscripción al servicio de datos para gráficos
    this.chartDataService.chartData$.subscribe((charData) => {
      this.graphData = charData.data;
      this.userId = charData.userId;
      this.timePeriod = charData.time;
      this.createChart();
    });
  }

  ngOnDestroy(): void {
    this.destroyChart();
    this.chartDataService.deleteChartData();
  }

  /**
   * Crea el gráfico lineal que representa la evolución de los 3 valores emocionales: arousal, valence y dimensional
   * a lo largo de un periodo temporal
   */
  createChart(): void {
    this.destroyChart();

    // Crear y adjuntar un nuevo canvas dinámicamente
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas_dimensional';
    this.canvasContainer.nativeElement.innerHTML = ''; // Limpia el contenedor
    this.canvasContainer.nativeElement.appendChild(canvas);

    // Generar etiquetas y datos para el gráfico
    const labels = [...new Set(this.graphData.map((item) => new Date(item.timestamp * 1000).toLocaleDateString()))];
    const arousalData = this.graphData.map((item) => parseFloat(item.arousal));
    const valenceData = this.graphData.map((item) => parseFloat(item.valence));
    const dominanceData = this.graphData.map((item) => parseFloat(item.dominance));

    // Crear el gráfico
    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Excitación',
            data: arousalData,
            borderColor: 'rgb(243, 163, 180)',
            fill: false,
            tension: 0.1,
          },
          {
            label: 'Intensidad',
            data: valenceData,
            borderColor: 'rgb(114, 147, 238)',
            fill: false,
            tension: 0.1,
          },
          {
            label: 'Dominancia',
            data: dominanceData,
            borderColor: 'rgb(204, 102, 0)',
            fill: false,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
              text: 'Time',
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10,
            },
          },
          y: {
            type: 'linear',
            title: {
              display: true,
              text: 'Value',
            },
            beginAtZero: true,
          },
        },
        plugins: {
          zoom: {
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'x',
            },
            pan: {
              enabled: true,
              mode: 'xy',
            },
          },
        },
      },
    });
  }

  private destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
