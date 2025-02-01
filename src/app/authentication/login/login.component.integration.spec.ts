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

  it('podría iniciar sesión', () => {
    component.loginForm.setValue({ username: 'user', password: 'password' });
    authService.login.and.returnValue(of({ access_token: 'fake-token' }));

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('user', 'password');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('no puede iniciar sesión', () => {
    component.loginForm.setValue({ username: 'user', password: 'password' });
    authService.login.and.returnValue(throwError(() => new Error('Error de autenticación')));

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('user', 'password');
    expect(component.errorMessage).toBe('Usuario o contraseña incorrectos.');
  });
});
