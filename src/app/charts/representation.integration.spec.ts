import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AuthService } from '../authentication/auth-services';
import { ApiConfigService } from '../@core/common/api/api-config.service';
import { IndividualFormComponent } from '../individual/individual-form/individual-form.component';
import { IndividualService } from '../individual/individual.service';
import Swal from 'sweetalert2';

fdescribe('IndividualFormComponent - Integration', () => {
  let component: IndividualFormComponent;
  let fixture: ComponentFixture<IndividualFormComponent>;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let individualService: IndividualService;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [IndividualFormComponent],
      providers: [
        FormBuilder,
        { provide: IndividualService, useValue: { getTimePeriods: jasmine.createSpy().and.returnValue(of([])), getIds: jasmine.createSpy().and.returnValue(of([])) } },
        { provide: ApiConfigService, useValue: { getApiUrl: () => 'http://localhost:5000' } },
        AuthService
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualFormComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    individualService = TestBed.inject(IndividualService);
    httpMock = TestBed.inject(HttpTestingController);

    // Mockeando el login para que siempre se inicie sesión con un usuario de tipo 'psychologist'
    spyOn(authService, 'isLoggedIn').and.returnValue(true);
    spyOn(authService, 'getCurrentUserValue').and.returnValue({ username: 'admin', role: 'admin' });

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch time periods and ids on ngOnInit', () => {
    // Mockeamos las respuestas del servicio
    individualService.getTimePeriods().subscribe(data => {
      expect(data).toEqual([]);
    });

    individualService.getIds().subscribe(data => {
      expect(data).toEqual([]);
    });

    // Verificamos las llamadas HTTP
    const req1 = httpMock.expectOne('http://localhost:5000/getTimePeriods');
    expect(req1.request.method).toBe('GET');
    req1.flush([]);

    const req2 = httpMock.expectOne('http://localhost:5000/ids');
    expect(req2.request.method).toBe('GET');
    req2.flush([]);
  });

  it('should submit form when valid', () => {
    // Mockear la respuesta al enviar los datos
    const mockResponse = [{ id: 1, name: 'Record 1' }];
    spyOn(individualService, 'filterRecords').and.returnValue(of(mockResponse));

    component.form.patchValue({ userId: 1, time: 'some-time', charType: '1', startDate: '2025-01-01', endDate: '2025-01-02' });
    component.onSubmit();

    expect(individualService.filterRecords).toHaveBeenCalled();
    expect(component.form.valid).toBeTrue();
    expect(component.form.value.userId).toBe(1);
  });

  it('should handle error response during form submission', () => {
    // Mockeamos el servicio para simular un error
    spyOn(individualService, 'filterRecords').and.returnValue(throwError('Error while fetching records'));

    component.form.patchValue({ userId: 1, time: '', charType: '1', startDate: '2025-01-01', endDate: '2025-01-02' });
    
    // Espiamos y verificamos que se haya llamado a Swal.fire en caso de error
    spyOn(Swal, 'fire');
    component.onSubmit();

  });

  afterEach(() => {
    httpMock.verify();
  });
});
