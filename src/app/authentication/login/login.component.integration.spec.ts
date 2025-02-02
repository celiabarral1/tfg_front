import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../auth-services';
import { ApiConfigService } from '../../@core/common/api/api-config.service';


describe('Gestión de Sesión - Integración', () => {
  let authService: AuthService;
  let httpMock: HttpTestingController;
  let apiUrl: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, ApiConfigService]
    });

    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    apiUrl = TestBed.inject(ApiConfigService).getApiUrl();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('usuario inicia sesión y se recibe token', () => {
    const mockResponse = { access_token: 'token' };

    authService.login('101', 'password1').subscribe(response => {
      expect(response.access_token).toBe(mockResponse.access_token);
      expect(localStorage.getItem('access_token')).toBe(mockResponse.access_token);
    });

    const req = httpMock.expectOne(`${apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('comprobar token y rol', () => {
    const token = btoa(JSON.stringify({ sub: { username: '101', role: 'operator' } }));
    const jwt = `header.${token}.signature`;
    localStorage.setItem('access_token', jwt);

    const user = authService.getUserFromToken(jwt);
    expect(user.username).toBe('101');
    expect(user.role).toBe('operator');
  });

  it('usuario no inicia sesión con credenciales incorrectas', () => {
      const mockErrorResponse = { status: 401, statusText: 'Unauthorized' };
  
      authService.login('user', 'wrongpassword').subscribe({
        next: () => fail('Debe fallar con credenciales incorrectas'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.statusText).toBe('Unauthorized');
        }
      });
  
      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      req.flush({ msg: 'Invalid credentials' }, mockErrorResponse);
    });

});
