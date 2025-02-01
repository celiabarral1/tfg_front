import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../auth-services';
import { LoginComponent } from './login.component';
import { of, throwError } from 'rxjs';

fdescribe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;;
  let router: jasmine.SpyObj<Router>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authService = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify(); 
  });

  it('crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('inicializar el formulario correctamente', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.controls['username']).toBeDefined();
    expect(component.loginForm.controls['password']).toBeDefined();
  });

  it('formulario como inválido', () => {
    expect(component.loginForm.valid).toBeFalse();
    component.onSubmit();
    httpTestingController.expectNone('/api/login');
  });

  it('formulario válido y correcto', () => {
    component.loginForm.setValue({ username: 'user', password: 'password1' });
    expect(component.loginForm.valid).toBeTrue();
  });


  it('iniciar sesión correcta', () => {
    component.loginForm.setValue({ username: '101', password: 'password1' });

    authService.login.and.returnValue(of({ access_token: 'token' }));
    component.onSubmit();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(component.errorMessage).toBeNull();
  });

  it('no inicia sesión', () => {
    authService.login.and.returnValue(throwError(() => new Error('Invalid credentials')));

    component.loginForm.setValue({ username: 'user', password: 'noregister' });
    
    component.onSubmit();
    
    expect(authService.login).toHaveBeenCalledWith('user', 'noregister'); 
    expect(component.errorMessage).toBe('Usuario o contraseña incorrectos.');
    expect(component.loginForm.value).toEqual({ username: null, password: null });
  });
});
