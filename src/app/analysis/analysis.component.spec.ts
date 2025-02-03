import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalysisComponent } from './analysis.component';
import { AnalysisService } from './analysis.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Classification } from './model/classification';
import { RouterTestingModule } from '@angular/router/testing';

fdescribe('AnalysisComponent', () => {
  let component: AnalysisComponent;
  let fixture: ComponentFixture<AnalysisComponent>;
  let mockAnalysisService: jasmine.SpyObj<AnalysisService>;
  let router: Router;
  const mockClassificationData = { no_disorder: [1, 2, 3], depression: [4, 5, 6],anxiety: [7, 8, 9],};

  beforeEach(async () => {
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

  it('crea el componente con datos', () => {
    expect(component).toBeTruthy();
 
    mockAnalysisService.getClassification.and.returnValue(of(mockClassificationData));

    component.ngOnInit();

    expect(component.classificationData.no_disorder).toEqual(mockClassificationData.no_disorder);
    expect(component.classificationData.depression).toEqual(mockClassificationData.depression);
    expect(component.classificationData.anxiety).toEqual(mockClassificationData.anxiety);
  });


    it('filtrar tendencia depresiva', () => {
      component.classificationData = new Classification([], [4, 5, 6], []);
      component.searchTerm = '5';

      expect(component.filteredDepression).toEqual([5]);
    });


    it('filtrar  tendencia ansiosa', () => {
      component.classificationData = new Classification([], [], [7, 8, 9]);
      component.searchTerm = '8';

      expect(component.filteredAnxiety).toEqual([8]);
    });

    it('filtrar no_disorder', () => {
      component.classificationData = new Classification([1, 2, 3], [], []);
      component.searchTerm = '2';

      expect(component.filteredNoDisorder).toEqual([2]);
    });

    it('leer más depresión', () => {
      component.showMore('depression');
      expect(component.showMoreDepression).toBeTrue();
    });

    it('leer más ansiedad', () => {
      component.showMore('anxiety');
      expect(component.showMoreAnxiety).toBeTrue();
    });

    it('leer más no_diorder', () => {
      component.showMore('noDisorder');
      expect(component.showMoreNoDisorder).toBeTrue();
    });

    it('navega con el id', () => {
      const routerSpy = spyOn(router, 'navigate');
      const id = 1;

      component.routeToRepresentation(id);

      expect(routerSpy).toHaveBeenCalledWith(['/representation', id]);
    });

    it('no hay datos pero si grupos', () => {
      const empty = new Classification();
      component.classificationData = empty;

      expect(component.classificationData.anxiety).toEqual([]);
      expect(component.classificationData.depression).toEqual([]);
      expect(component.classificationData.no_disorder).toEqual([]);
    });

});
