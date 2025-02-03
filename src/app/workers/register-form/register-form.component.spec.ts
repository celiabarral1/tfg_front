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

  it('crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('inicializar el formulario', () => {
    expect(component.registerForm).toBeDefined();
  });

  it('debería cargar roles e IDs', () => {
    const mockRoles = [{ label: 'Admin', value: 'admin' }];
    const mockIds = ['1', '2'];
    employeeService.getRols.and.returnValue(of(mockRoles));
    employeeService.getWorkersId.and.returnValue(of(mockIds));

    component.ngOnInit();
    expect(employeeService.getRols).toHaveBeenCalled();
    expect(employeeService.getWorkersId).toHaveBeenCalled();
    expect(component.roles).toEqual(mockRoles);
    expect(component.ids).toEqual(jasmine.arrayContaining(mockIds));

  });


  it('dar de alta trabajador', () => {
    spyOn(console, 'log');
    const mockEmployee = new Employee('1', 'operator', new Date('2025-10-11'));
    employeeService.insertEmployee.and.returnValue(of(mockEmployee));

    component.registerForm.setValue({ id: '1', rol: 'operator', registration_date: '2025-10-11' });
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
