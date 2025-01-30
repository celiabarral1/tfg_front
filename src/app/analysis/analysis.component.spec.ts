import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalysisComponent } from './analysis.component';
import { AnalysisService } from './analysis.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Classification } from './model/classification';
import { RouterTestingModule } from '@angular/router/testing';

describe('AnalysisComponent', () => {
  let component: AnalysisComponent;
  let fixture: ComponentFixture<AnalysisComponent>;
  let mockAnalysisService: jasmine.SpyObj<AnalysisService>;
  let router: Router;

  beforeEach(async () => {
    // Crear un mock del servicio
    mockAnalysisService = jasmine.createSpyObj('AnalysisService', ['getClassification']);

    await TestBed.configureTestingModule({
      declarations: [AnalysisComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: AnalysisService, useValue: mockAnalysisService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalysisComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debería cargar los datos de clasificación correctamente', () => {
      const mockClassificationData = {
        no_disorder: [1, 2, 3],
        depression: [4, 5, 6],
        anxiety: [7, 8, 9],
      };
      mockAnalysisService.getClassification.and.returnValue(of(mockClassificationData));

      component.ngOnInit();

      expect(component.classificationData.no_disorder).toEqual(mockClassificationData.no_disorder);
      expect(component.classificationData.depression).toEqual(mockClassificationData.depression);
      expect(component.classificationData.anxiety).toEqual(mockClassificationData.anxiety);
    });

    it('debería manejar errores al obtener los datos de clasificación', () => {
      const consoleSpy = spyOn(console, 'error');
      mockAnalysisService.getClassification.and.returnValue(throwError(() => new Error('Error de API')));

      component.ngOnInit();

      expect(consoleSpy).toHaveBeenCalledWith('Error al obtener la clasificación:', jasmine.any(Error));
    });
  });

  describe('filteredDepression', () => {
    it('debería filtrar correctamente los trabajadores con tendencia depresiva', () => {
      component.classificationData = new Classification([], [4, 5, 6], []);
      component.searchTerm = '5';

      expect(component.filteredDepression).toEqual([5]);
    });
  });

  describe('filteredAnxiety', () => {
    it('debería filtrar correctamente los trabajadores con tendencia ansiosa', () => {
      component.classificationData = new Classification([], [], [7, 8, 9]);
      component.searchTerm = '8';

      expect(component.filteredAnxiety).toEqual([8]);
    });
  });

  describe('filteredNoDisorder', () => {
    it('debería filtrar correctamente los trabajadores sin tendencia llamativa', () => {
      component.classificationData = new Classification([1, 2, 3], [], []);
      component.searchTerm = '2';

      expect(component.filteredNoDisorder).toEqual([2]);
    });
  });

  describe('showMore', () => {
    it('debería mostrar más elementos para el grupo de depresión', () => {
      component.showMore('depression');
      expect(component.showMoreDepression).toBeTrue();
    });

    it('debería mostrar más elementos para el grupo de ansiedad', () => {
      component.showMore('anxiety');
      expect(component.showMoreAnxiety).toBeTrue();
    });

    it('debería mostrar más elementos para el grupo sin desórdenes', () => {
      component.showMore('noDisorder');
      expect(component.showMoreNoDisorder).toBeTrue();
    });
  });

  describe('routeToRepresentation', () => {
    it('debería navegar a la vista de representación con el id proporcionado', () => {
      const routerSpy = spyOn(router, 'navigate');
      const id = 123;

      component.routeToRepresentation(id);

      expect(routerSpy).toHaveBeenCalledWith(['/representation', id]);
    });
  });
});
