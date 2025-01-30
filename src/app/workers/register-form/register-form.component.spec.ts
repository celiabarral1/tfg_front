import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterFormComponent } from './register-form.component';
import { EmployeeService } from '../employee.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';

// Mock de EmployeeService
const mockEmployeeService = {
  getRols: jasmine.createSpy('getRols').and.returnValue(of(['Admin', 'User'])),
  insertEmployee: jasmine.createSpy('insertEmployee').and.returnValue(of({ success: true })),
};

fdescribe('RegisterFormComponent', () => {
  let component: RegisterFormComponent;
  let fixture: ComponentFixture<RegisterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, NgSelectModule],
      declarations: [RegisterFormComponent],
      providers: [
        FormBuilder,
        { provide: EmployeeService, useValue: mockEmployeeService },
        { provide: ChangeDetectorRef, useValue: { detectChanges: () => {} } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and fetch roles', () => {
    component.ngOnInit();
    expect(mockEmployeeService.getRols).toHaveBeenCalled();
    expect(component.roles.length).toBeGreaterThan(0);
  });

  it('should submit valid form', () => {
    spyOn(console, 'log');
    component.registerForm.setValue({
      id: '123',
      rol: 'Admin',
      registration_date: '2023-01-01',
    });

    mockEmployeeService.insertEmployee.and.returnValue(of({ success: true }));
    component.onSubmit();

    expect(mockEmployeeService.insertEmployee).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Employee registered successfully:', { success: true });
  });

  it('should log error on failed submission', () => {
    spyOn(console, 'error');
    mockEmployeeService.insertEmployee.and.returnValue(throwError(() => new Error('Error inserting employee')));
    component.registerForm.setValue({
      id: '123',
      rol: 'Admin',
      registration_date: '2023-01-01',
    });

    component.onSubmit();

    expect(console.error).toHaveBeenCalledWith('Error registering employee:', jasmine.any(Error));
  });
});
