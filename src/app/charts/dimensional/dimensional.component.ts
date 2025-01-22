import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js'; // Importa 'registerables'
import { ChartDataService } from '../../shared/shared/chart-data.service';
import { DateHelper } from '../../@core/common/utils/date-helper';
import zoomPlugin from 'chartjs-plugin-zoom';

@Component({
  selector: 'app-dimensional',
  templateUrl: './dimensional.component.html',
  styleUrls: ['./dimensional.component.scss']
})
export class DimensionalComponent implements OnInit, OnDestroy {
  public chart: any;
  public graphData: any[] = [];
  public userId: any;
  public timePeriod: any;

  constructor(private chartDataService: ChartDataService, private cdr: ChangeDetectorRef) {
    Chart.register(...registerables);
    if (typeof window !== 'undefined') {
      import('chartjs-plugin-zoom').then((zoomPlugin) => {
        Chart.register(zoomPlugin.default);
      });
    } 
  }

  ngOnInit(): void {
    this.chartDataService.chartData$.subscribe(charData => {
      this.graphData = charData.data;
      this.userId = charData.userId;
      this.timePeriod = charData.time;
      this.createChart(); 
    });
  }

  ngOnDestroy(): void {
    if (this.chart) {
      console.log("Destroying chart on component destroy");
      this.chart.destroy();
      this.chart = null; // Limpia la referencia
    }
    this.chartDataService.deleteChartData();
  }
  

  createChart(): void {
    const canvas = document.getElementById('canvas_dimensional') as HTMLCanvasElement;
  if (!canvas) {
    console.warn("Canvas not available for chart creation.");
    return;
  }
    // Asegúrate de destruir el gráfico anterior si existe
    if (this.chart) {
      console.log("Destroying previous chart before creating a new one");
      this.chart.destroy();
      this.chart = null; // Limpia la referencia
    }
  
    // Convertir el timestamp en fechas legibles (en días)
    let labels = this.graphData.map(item => {
      const date = new Date(item.timestamp * 1000); 
      return date.toLocaleDateString(); 
    });
  
    labels = [...new Set(labels)]; 
  
    const arousalData = this.graphData.map(item => parseFloat(item.arousal));
    const valenceData = this.graphData.map(item => parseFloat(item.valence));
    const dominanceData = this.graphData.map(item => parseFloat(item.dominance));
  
    // Crear el nuevo gráfico
    this.chart = new Chart('canvas_dimensional', {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Arousal',
            data: arousalData,
            borderColor: 'rgba(255, 99, 132, 1)',
            fill: false,
            tension: 0.1
          },
          {
            label: 'Valence',
            data: valenceData,
            borderColor: 'rgba(54, 162, 235, 1)',
            fill: false,
            tension: 0.1
          },
          {
            label: 'Dominance',
            data: dominanceData,
            borderColor: 'rgb(0, 204, 102)',
            fill: false,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
              text: 'Time'
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10
            }
          },
          y: {
            type: 'linear',
            title: {
              display: true,
              text: 'Value'
            },
            beginAtZero: true
          }
        },
        plugins: {
          zoom: {
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'x'
            },
            pan: {
              enabled: true,
              mode: 'xy'
            }
          },
          legend: {
            onClick: (event, legendItem) => this.changeLegendVisibility(legendItem)
          }
        },
        onClick: (event) => this.changeLineVisibility(event)
      }
    });
  }
  
  

  changeLineVisibility(event: any): void {
    //no sé si pone el intersect a false (pilla puntos de fuera de las líneas)
    // o true (solo los puntos marcados)
    const clickPoints = this.chart.getElementsAtEventForMode(
      event.native, 'dataset', { intersect: true }, true
    );
  
    if (clickPoints) {
      let datasetIndex = clickPoints[0].datasetIndex;
      let variableToHidde = this.chart.data.datasets[datasetIndex];
  
      if (variableToHidde.hidden) {
        this.chart.data.datasets.forEach((variable: { hidden: boolean; }) => {
          variable.hidden = false;
        });
      } else {
        this.chart.data.datasets.forEach((variable: { hidden: boolean; }, index: any) => {
          variable.hidden = index !== datasetIndex;
        });
      }
      this.chart.update();
    }
  }

  changeLegendVisibility(legendItem: any): void {
    const datasetIndex = legendItem.datasetIndex;
  
    if (typeof datasetIndex === 'number' && this.chart?.data?.datasets[datasetIndex]) {
      const dataset = this.chart.data.datasets[datasetIndex];
      dataset.hidden = !dataset.hidden; // Cambia la visibilidad de la línea
      this.chart.update(); // Actualiza el gráfico
    } else {
      console.error('No se pudo encontrar el conjunto de datos para la leyenda seleccionada.');
    }
  }

  
}
