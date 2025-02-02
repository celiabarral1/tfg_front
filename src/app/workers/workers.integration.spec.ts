import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EmployeeService } from './employee.service';
import { RegisterFormComponent } from './register-form/register-form.component';
import { AuthService } from '../authentication/auth-services';

fdescribe('RegisterFormComponent - Integracion', () => {
  let component: RegisterFormComponent;
  let fixture: ComponentFixture<RegisterFormComponent>;
  let employeeService: EmployeeService;
  let authService: AuthService;

  const mockRoles = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'operator' }
  ];

  const mockIds = [1, 2, 3];

  const mockUser = { username: 'admin', role: 'admin' }; // Simular usuario logueado como admin
  const mockToken = 'valid.token.here';  // Simula un token válido para pruebas

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RegisterFormComponent],
      providers: [
        FormBuilder,
        {
          provide: EmployeeService,
          useValue: {
            getRols: jasmine.createSpy().and.returnValue(of(mockRoles)),
            getWorkersId: jasmine.createSpy().and.returnValue(of(mockIds)),
            insertEmployee: jasmine.createSpy().and.returnValue(of({}))
          }
        },
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: jasmine.createSpy().and.returnValue(true),
            getCurrentUserValue: jasmine.createSpy().and.returnValue(mockUser),
            getToken: jasmine.createSpy().and.returnValue(mockToken),
            getUserFromToken: jasmine.createSpy().and.returnValue(mockUser)
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Para evitar errores por elementos no declarados
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterFormComponent);
    component = fixture.componentInstance;
    employeeService = TestBed.inject(EmployeeService);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    component.ngOnInit();

    expect(component.registerForm.get('rol')?.value).toBe('admin');
    expect(component.registerForm.get('registration_date')?.value).toBe(new Date().toISOString().split('T')[0]);
  });

  it('should call insertEmployee when form is valid', () => {
    component.registerForm.setValue({
      id: 1,
      rol: 'user',
      registration_date: new Date().toISOString().split('T')[0]
    });

    component.onSubmit();

    expect(employeeService.insertEmployee).toHaveBeenCalled();
  });

  it('should log "Formulario inválido" when form is invalid', () => {
    spyOn(console, 'log');

    component.registerForm.setValue({
      id: null, // invalid id
      rol: 'user',
      registration_date: new Date().toISOString().split('T')[0]
    });

    component.onSubmit();

    expect(console.log).toHaveBeenCalledWith('Formulario inválido');
  });
});
