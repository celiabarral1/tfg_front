import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DimensionalComponent } from './dimensional.component';
import { ChartDataService } from '../../shared/shared/chart-data.service';
import { of } from 'rxjs';
import { ElementRef } from '@angular/core';
import { Chart } from 'chart.js';

const mockChartDataService = {
  chartData$: of({ data: [], time: '', userId: '' }),
  deleteChartData: jasmine.createSpy('deleteChartData'),
};

fdescribe('DimensionalComponent', () => {
  let component: DimensionalComponent;
  let fixture: ComponentFixture<DimensionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DimensionalComponent],
      providers: [
        { provide: ChartDataService, useValue: mockChartDataService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DimensionalComponent);
    component = fixture.componentInstance;
    
    component.canvasContainer = new ElementRef(document.createElement('div'));
    fixture.detectChanges();
  });

  it('crear componente', () => {
    expect(component).toBeTruthy();
  });

  it('inicializa sin datos', () => {
    component.ngOnInit();
    expect(component.graphData).toEqual([]);
  });

  it('destrye correctamente el gráfico', () => {
    spyOn(component as any, 'destroyChart');
    component.ngOnDestroy();
    expect((component as any).destroyChart).toHaveBeenCalled();
    expect(mockChartDataService.deleteChartData).toHaveBeenCalled();
  });

  it('crea un gráfico con datos dimensionales', () => {
    spyOn(component as any, 'destroyChart');
    spyOn(Chart.prototype, 'destroy');
    component.graphData = [
      { timestamp: 1700000000, arousal: '0.5', valence: '0.8', dominance: '-0.3' }
    ];
    component.createChart();
    expect((component as any).chart).toBeDefined();
    expect((component as any).destroyChart).toHaveBeenCalled();
  });


});
