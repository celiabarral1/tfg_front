import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndividualFormComponent } from './individual-form.component';
import { IndividualService } from '../individual.service';
import { ChartDataService } from '../../shared/shared/chart-data.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';

// Mock de IndividualService
const mockIndividualService = {
  getTimePeriods: jasmine.createSpy('getTimePeriods').and.returnValue(of(['Last Week', 'Last Month'])),
  filterRecords: jasmine.createSpy('filterRecords').and.returnValue(of([])),
};

// Mock de ChartDataService
const mockChartDataService = {
  updateChartData: jasmine.createSpy('updateChartData'),
};

fdescribe('IndividualFormComponent', () => {
  let component: IndividualFormComponent;
  let fixture: ComponentFixture<IndividualFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, NgSelectModule], // Importamos NgSelectModule
      declarations: [IndividualFormComponent],
      providers: [
        FormBuilder,
        { provide: IndividualService, useValue: mockIndividualService },
        { provide: ChartDataService, useValue: mockChartDataService },
        { provide: ChangeDetectorRef, useValue: { detectChanges: () => {} } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], // Esto evita el error con ng-select
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualFormComponent);
    component = fixture.componentInstance;
    component.startDate = new ElementRef(document.createElement('input'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and fetch time periods', () => {
    component.ngOnInit();
    expect(mockIndividualService.getTimePeriods).toHaveBeenCalled();
    expect(component.options.length).toBeGreaterThan(0);
  });


  it('should disable/enable time selection on date input', () => {
    component.form.controls['startDate'].setValue('2023-01-01');
    component.onManualDate();
    expect(component.form.controls['time'].disabled).toBeTrue();

    component.form.controls['startDate'].setValue('');
    component.onManualDate();
    expect(component.form.controls['time'].disabled).toBeFalse();
  });

  it('should submit valid form', () => {
    spyOn(component.charTypeChange, 'emit');
    component.form.setValue({
      userId: '123',
      time: 'Last Week',
      charType: '1',
      startDate: '',
      endDate: '',
    });

    component.onSubmit();

    expect(mockIndividualService.filterRecords).toHaveBeenCalled();
    expect(component.charTypeChange.emit).toHaveBeenCalledWith('1');
  });

  it('should emit charType change', () => {
    spyOn(component.charTypeChange, 'emit');
    component.onCharTypeChange('0');
    expect(component.charTypeChange.emit).toHaveBeenCalledWith('0');
  });
});