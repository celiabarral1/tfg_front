import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraphicRepresentationComponent } from './graphic-representation.component';
import { ChartDataService } from '../../shared/shared/chart-data.service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { Record } from '../../shared/shared/model/record';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

fdescribe('GraphicRepresentationComponent', () => {
  let component: GraphicRepresentationComponent;
  let fixture: ComponentFixture<GraphicRepresentationComponent>;
  let chartDataService: jasmine.SpyObj<ChartDataService>;
  let route: ActivatedRoute;
  let cdr: ChangeDetectorRef;
  const mockRecord = new Record({
    Emotion_1_label: 'happiness',
    Emotion_1_mean: 0.8,
    Emotion_1_std: 0.1,
    Emotion_2_label: 'neutral',
    Emotion_2_mean: 0.15,
    Emotion_2_std: 0.05,
    Emotion_3_label: 'sadness',
    Emotion_3_mean: 0.05,
    Emotion_3_std: 0.02,
    arousal: 0.7,
    dominance: 0.6,
    file_name: 'audio_123.wav',
    timestamp: 1672531200,
    user_id: 101,
    valence: 0.75
  });

  const mockData = [mockRecord];

  beforeEach(async () => {
    const chartDataServiceSpy = jasmine.createSpyObj('ChartDataService', ['chartData$', 'deleteChartData']);

    await TestBed.configureTestingModule({
      declarations: [GraphicRepresentationComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: ChartDataService, useValue: chartDataServiceSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '123' } } } },
        { provide: ChangeDetectorRef, useValue: { detectChanges: () => {} } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    
    fixture = TestBed.createComponent(GraphicRepresentationComponent);
    component = fixture.componentInstance;
    chartDataService = TestBed.inject(ChartDataService) as jasmine.SpyObj<ChartDataService>;
    route = TestBed.inject(ActivatedRoute);
    cdr = TestBed.inject(ChangeDetectorRef);
  });

  it('crea el componente', () => {
    expect(component).toBeTruthy();
  });

  it('ir a pestaña turnos con form limpio', () => {
    component.selectTab('turnos');
    expect(component.selectedTab).toBe('turnos');
    expect(component.charType).toBe('1');
    expect(chartDataService.deleteChartData).toHaveBeenCalled();
  });

  it('cambiar tipo de gráfico', () => {
    component.onCharTypeChange('0');
    expect(component.charType).toBe('0');
  });

  it('deshabilitar descargar', () => {
    component.graphData = [];
    expect(component.isDisabled()).toBeTrue();
  });

  it('si hay datos habilita botón', () => {
    component.graphData = [1, 2, 3];
    expect(component.isDisabled()).toBeFalse();

    spyOn(document, 'getElementById').and.returnValue({ scrollIntoView: () => {} } as HTMLElement);
    component.scrollToGraphic();
    expect(document.getElementById).toHaveBeenCalledWith('graphic-representation');
  });
});
