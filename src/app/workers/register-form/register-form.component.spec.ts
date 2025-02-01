import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterFormComponent } from './register-form.component';
import { EmployeeService } from '../employee.service';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Employee } from '../model/employee';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

fdescribe('RegisterFormComponent', () => {
  let component: RegisterFormComponent;
  let fixture: ComponentFixture<RegisterFormComponent>;
  let employeeService: jasmine.SpyObj<EmployeeService>;

  beforeEach(async () => {
    const employeeServiceSpy = jasmine.createSpyObj('EmployeeService', ['getRols', 'getWorkersId', 'insertEmployee']);

    await TestBed.configureTestingModule({
      declarations: [RegisterFormComponent],
      imports: [ReactiveFormsModule, FormsModule],
      providers: [
        FormBuilder,
        { provide: EmployeeService, useValue: employeeServiceSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterFormComponent);
    component = fixture.componentInstance;
    employeeService = TestBed.inject(EmployeeService) as jasmine.SpyObj<EmployeeService>;
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con valores por defecto', () => {
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get('registration_date')?.value).toBe(new Date().toISOString().split('T')[0]);
  });

  it('debería cargar roles e IDs en ngOnInit', () => {
    const mockRoles = [{ label: 'Admin', value: 'admin' }];
    const mockIds = ['123', '456'];
    employeeService.getRols.and.returnValue(of(mockRoles));
    employeeService.getWorkersId.and.returnValue(of(mockIds));

    component.ngOnInit();
    expect(employeeService.getRols).toHaveBeenCalled();
    expect(employeeService.getWorkersId).toHaveBeenCalled();
    expect(component.roles).toEqual(mockRoles);
    expect(component.ids).toEqual(jasmine.arrayContaining(mockIds));

  });

  it('debería convertir datos del formulario en una instancia de Employee', () => {
    const formValue = { id: '123', rol: 'admin', registration_date: '2024-01-01' };
    const employee = component.parseForm(formValue);
    expect(employee).toEqual(new Employee('123', 'admin', new Date('2024-01-01')));
  });

  it('debería llamar a insertEmployee cuando el formulario es válido', () => {
    spyOn(console, 'log');
    const mockEmployee = new Employee('123', 'admin', new Date('2024-01-01'));
    employeeService.insertEmployee.and.returnValue(of(mockEmployee));

    component.registerForm.setValue({ id: '123', rol: 'admin', registration_date: '2024-01-01' });
    component.onSubmit();

    expect(employeeService.insertEmployee).toHaveBeenCalledWith(mockEmployee);
    expect(console.log).toHaveBeenCalledWith('Employee registered successfully:', mockEmployee);
  });

  it('debería no registrar un empleado si el formulario es inválido', () => {
    spyOn(console, 'log');
    component.registerForm.setValue({ id: '', rol: 'admin', registration_date: '2024-01-01' });
    component.onSubmit();
    expect(console.log).toHaveBeenCalledWith('Formulario inválido');
  });
});
