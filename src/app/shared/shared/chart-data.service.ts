import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Record } from './model/record';
import { ChartData } from './model/char-data';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {

  // Usamos un BehaviorSubject para almacenar los datos y permitir que los componentes se suscriban a los cambios
  private chartDataSource = new BehaviorSubject<ChartData>({ data: [], time: '', userId: '' });
  
  chartData$ = this.chartDataSource.asObservable();

  constructor() {}

  updateChartData(data: Record[], time:string, userId:string): void {
    const chartData: ChartData = { data, time, userId };
    this.chartDataSource.next(chartData);
  }

  deleteChartData(): void {
    const emptyChartData: ChartData = { data: [], time: '', userId: '' };
    this.chartDataSource.next(emptyChartData);
  }
}
