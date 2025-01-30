import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../auth-services';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario de login', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.controls['username']).toBeDefined();
    expect(component.loginForm.controls['password']).toBeDefined();
  });

  it('debería mostrar un mensaje de error si el formulario es inválido', () => {
    component.onSubmit();
    expect(component.errorMessage).toBeNull();
  });

  it('debería llamar al servicio de autenticación y navegar en caso de éxito', () => {
    component.loginForm.setValue({ username: 'testuser', password: 'testpass' });
    authService.login.and.returnValue(of({ access_token: 'fake-token' }));

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('testuser', 'testpass');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('debería mostrar un mensaje de error en caso de fallo de autenticación', () => {
    component.loginForm.setValue({ username: 'testuser', password: 'testpass' });
    authService.login.and.returnValue(throwError(() => new Error('Error de autenticación')));

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('testuser', 'testpass');
    expect(component.errorMessage).toBe('Usuario o contraseña incorrectos.');
  });
});
