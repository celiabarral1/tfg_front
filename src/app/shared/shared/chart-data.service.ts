import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Record } from './model/record';
import { ChartData } from './model/char-data';

/**
 * Servicio ChartDataService
 * 
 * Este servicio proporciona una fuente de datos reactiva para componentes de visualización gráfica.
 * Utiliza `BehaviorSubject` para almacenar y emitir datos de tipo `ChartData` que incluyen:
 *  - Lista de registros (`Record[]`)
 *  - Identificador del usuario asociado (`userId`)
 *  - Periodo temporal analizado (`time`)
 * 
 * Está diseñado para facilitar la comunicación entre componentes que muestran gráficos
 * y los que actualizan o eliminan dichos datos.
 */
@Injectable({
  providedIn: 'root'
})
export class ChartDataService {
  /**
   * Fuente interna de datos para gráficos. 
   * Comienza con un estado vacío por defecto.
   */
  private chartDataSource = new BehaviorSubject<ChartData>({ data: [], time: '', userId: '' });

  /**
   * Observable expuesto públicamente que permite a otros componentes suscribirse
   * y reaccionar a los cambios en los datos del gráfico.
   */
  chartData$ = this.chartDataSource.asObservable();

  constructor() {}

  /**
   * Actualiza el conjunto de datos de gráfico con nuevos valores.
   * 
   * @param data Lista de registros emocionales o métricas a representar.
   * @param time Periodo temporal.
   * @param userId Identificador usuario.
   */
  updateChartData(data: Record[], time: string, userId: string): void {
    const chartData: ChartData = { data, time, userId };
    this.chartDataSource.next(chartData);
    console.log(this.chartData$);
  }

  /**
   * Elimina los datos actuales del gráfico y los resetea a su estado inicial.
   */
  deleteChartData(): void {
    const emptyChartData: ChartData = { data: [], time: '', userId: '' };
    this.chartDataSource.next(emptyChartData);
  }
}