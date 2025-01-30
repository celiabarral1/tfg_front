import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoricComponent } from './categoric.component';
import { ChartDataService } from '../../shared/shared/chart-data.service';
import { IndividualService } from '../../individual/individual.service';
import { of } from 'rxjs';
import { ElementRef } from '@angular/core';
import { Chart } from 'chart.js';

// Mock de ChartDataService
const mockChartDataService = {
  chartData$: of({ data: [], time: '', userId: '' }),
  deleteChartData: jasmine.createSpy('deleteChartData'),
};

// Mock de IndividualService
const mockIndividualService = {
  getEmotions: jasmine.createSpy('getEmotions').and.returnValue(of(['joy', 'anger', 'sadness'])),
};

fdescribe('CategoricComponent', () => {
  let component: CategoricComponent;
  let fixture: ComponentFixture<CategoricComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CategoricComponent],
      providers: [
        { provide: ChartDataService, useValue: mockChartDataService },
        { provide: IndividualService, useValue: mockIndividualService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoricComponent);
    component = fixture.componentInstance;
    
    // Mock de los elementos del DOM
    component.canvasCategoric = new ElementRef(document.createElement('div'));
    component.canvasAccumulated = new ElementRef(document.createElement('div'));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and fetch emotions', () => {
    component.ngOnInit();
    expect(mockIndividualService.getEmotions).toHaveBeenCalled();
  });

  it('should destroy charts on ngOnDestroy', () => {
    spyOn(component, 'destroyChart');
    component.ngOnDestroy();
    expect(component.destroyChart).toHaveBeenCalledWith(component.chart);
    expect(component.destroyChart).toHaveBeenCalledWith(component.accumulatedChart);
    expect(mockChartDataService.deleteChartData).toHaveBeenCalled();
  });

  it('should create chart', () => {
    spyOn(component, 'destroyChart');
    spyOn(Chart.prototype, 'destroy');
    component.graphData = [{ timestamp: 1700000000, Emotion_1_label: 'joy', Emotion_2_label: 'anger', Emotion_3_label: 'sadness' }];
    component.emotions = ['joy', 'anger', 'sadness'];
    component.createChart();
    expect(component.chart).toBeDefined();
    expect(component.destroyChart).toHaveBeenCalled();
  });

  it('should create accumulated study chart', () => {
    spyOn(component, 'destroyChart');
    component.graphData = [
      { Emotion_1_label: 'joy', Emotion_2_label: 'joy', Emotion_3_label: 'anger' },
      { Emotion_1_label: 'sadness', Emotion_2_label: 'joy', Emotion_3_label: 'joy' },
    ];
    component.emotions = ['joy', 'anger', 'sadness'];
    component.createAccumulatedStudyChart();
    expect(component.accumulatedChart).toBeDefined();
    expect(component.destroyChart).toHaveBeenCalled();
  });
});
