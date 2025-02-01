import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndividualFormComponent } from './individual-form.component';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IndividualService } from '../individual.service';
import { ChartDataService } from '../../shared/shared/chart-data.service';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import Swal from 'sweetalert2';

describe('IndividualFormComponent', () => {
  let component: IndividualFormComponent;
  let fixture: ComponentFixture<IndividualFormComponent>;
  let individualService: jasmine.SpyObj<IndividualService>;
  let chartDataService: jasmine.SpyObj<ChartDataService>;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(async () => {
    const individualServiceSpy = jasmine.createSpyObj('IndividualService', ['getTimePeriods', 'getIds', 'filterRecords']);
    const chartDataServiceSpy = jasmine.createSpyObj('ChartDataService', ['updateChartData']);
    const cdrSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      declarations: [IndividualFormComponent],
      imports: [ReactiveFormsModule, FormsModule],
      providers: [
        FormBuilder,
        { provide: IndividualService, useValue: individualServiceSpy },
        { provide: ChartDataService, useValue: chartDataServiceSpy },
        { provide: ChangeDetectorRef, useValue: cdrSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(IndividualFormComponent);
    component = fixture.componentInstance;
    individualService = TestBed.inject(IndividualService) as jasmine.SpyObj<IndividualService>;
    chartDataService = TestBed.inject(ChartDataService) as jasmine.SpyObj<ChartDataService>;
    cdr = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;
  });

  it('crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('inicializa', () => {
    expect(component.form).toBeDefined();
    expect(component.form.get('userId')).toBeDefined();
    expect(component.form.get('charType')).toBeDefined();
    individualService.getTimePeriods.and.returnValue(of(['option1', 'option2']));
    individualService.getIds.and.returnValue(of(['id1', 'id2']));
    component.ngOnInit();
    expect(individualService.getTimePeriods).toHaveBeenCalled();
    expect(individualService.getIds).toHaveBeenCalled();
  });

  it('cambia id', () => {
    component.id = '1';
    component.ngOnChanges({ id: { currentValue: '', previousValue: null, firstChange: true, isFirstChange: () => true } });
    expect(component.form.get('userId')?.value).toBe('1');
  });

  it('debería marcar error si no se selecciona tiempo o fechas', () => {
    component.form.patchValue({ userId: '123', time: null, startDate: '', endDate: '' });
    component.form.markAllAsTouched();
    component.form.updateValueAndValidity(); 
    console.log('Errores actuales del formulario:', component.form.errors);
    expect(component.dateOrTimeValidator(component.form)).toEqual({ dateOrTimeRequired: true });
  });

  it('debería permitir fechas válidas', () => {
    component.form.patchValue({ startDate: '2024-01-01', endDate: '2024-01-02' });
    expect(component.dateValidator(component.form)).toBeNull();
  });

  it('debería marcar error si la fecha de inicio es mayor que la de fin', () => {
    component.form.patchValue({ startDate: '2026-08-09', endDate: '2024-02-02' });
    component.form.markAllAsTouched();
    component.form.updateValueAndValidity(); 
    expect(component.dateValidator(component.form)).toEqual({ invalidDateRange: true });
  });

  it('debería actualizar tipo de gráfico al cambiar de selección', () => {
    spyOn(component.charTypeChange, 'emit');
    component.onCharTypeChange('0');
    expect(component.charTypeChange.emit).toHaveBeenCalledWith('0');
  });

  it('debería llamar a Swal cuando no hay registros', () => {
    spyOn(Swal, 'fire');
    individualService.filterRecords.and.returnValue(of([]));
    component.onSubmit();
    expect(Swal.fire).toHaveBeenCalled();
  });

  it('debería llamar a updateChartData si hay registros', () => {
    const mockRecords = [{ user_id: 1, valence: 0.5 }];
    individualService.filterRecords.and.returnValue(of(mockRecords));
    spyOn(component, 'onSubmit').and.callThrough();
    component.onSubmit();
    expect(chartDataService.updateChartData).toHaveBeenCalled();
  });
});
