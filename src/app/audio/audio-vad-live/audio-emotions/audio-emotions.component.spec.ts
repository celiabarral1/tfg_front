import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AudioEmotionsComponent } from './audio-emotions.component';
import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { AuthService } from '../../../authentication/auth-services';
import WaveSurfer from 'wavesurfer.js';
import { of } from 'rxjs';

class MockAuthService {
  isAuthorized(...roles: string[]): boolean {
    return true; // Mockea para que siempre retorne true y evitar cambios inesperados en la vista
  }
}

const mockWaveSurferInstance = {
  on: jasmine.createSpy('on'),
  playPause: jasmine.createSpy('playPause'),
  getCurrentTime: jasmine.createSpy('getCurrentTime').and.returnValue(0),
  destroy: jasmine.createSpy('destroy'),
  setVolume: jasmine.createSpy('setVolume'),
  pause: jasmine.createSpy('pause'),
  backend: { setFilter: jasmine.createSpy('setFilter') },
};


describe('AudioEmotionsComponent', () => {
  let component: AudioEmotionsComponent;
  let fixture: ComponentFixture<AudioEmotionsComponent>;
  let mockAuthService: MockAuthService;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();

    await TestBed.configureTestingModule({
      declarations: [AudioEmotionsComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        ChangeDetectorRef,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AudioEmotionsComponent);
    component = fixture.componentInstance;

    // Mockea el contenedor de WaveSurfer
    component.waveformContainer = {
      nativeElement: document.createElement('div'),
    } as ElementRef;

    // Mockear isAuthorized para evitar ExpressionChangedAfterItHasBeenCheckedError
    component.isAuthorized = true;

    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit', () => {
    it('debería inicializar WaveSurfer si audioBlob está definido', () => {
      const createSpy = spyOn(WaveSurfer, 'create').and.callThrough();
      component.audioBlob = new Blob(['test audio'], { type: 'audio/wav' });

      component.ngAfterViewInit();

      expect(createSpy).toHaveBeenCalled();
      expect(component.isAuthorized).toBeTrue();
    });

    it('no debería inicializar WaveSurfer si audioBlob no está definido', () => {
      const createSpy = spyOn(WaveSurfer, 'create');

      component.ngAfterViewInit();

      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('debería llamar a createWaveSurfer cuando audioBlob cambia', () => {
      const createWaveSurferSpy = spyOn(component, 'createWaveSurfer');

      component.audioBlob = new Blob(['test audio'], { type: 'audio/wav' });
      component.ngOnChanges({
        audioBlob: {
          currentValue: component.audioBlob,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      });

      expect(createWaveSurferSpy).toHaveBeenCalled();
    });
  });

  describe('createWaveSurfer', () => {
    it('debería inicializar WaveSurfer con el audioBlob sin requerir load()', () => {
      spyOn(WaveSurfer, 'create').and.returnValue(mockWaveSurferInstance as unknown as WaveSurfer);
      component.audioBlob = new Blob(['test audio'], { type: 'audio/wav' });
      component.createWaveSurfer();

      expect(WaveSurfer.create).toHaveBeenCalled();
    });
  });

  describe('playPause', () => {
    it('debería llamar a playPause en la instancia de WaveSurfer', () => {
      component.waveSurfer = { playPause: jasmine.createSpy() };

      component.playPause();

      expect(component.waveSurfer.playPause).toHaveBeenCalled();
    });
  });

  describe('download', () => {
    it('debería descargar el archivo de audio con el índice y extensión correctos', () => {
      const blob = new Blob(['test audio'], { type: 'audio/wav' });
      const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:http://example.com');
      
      // Mock de un elemento <a>
      const mockAnchor = document.createElement('a');
      const clickSpy = spyOn(mockAnchor, 'click');
      spyOn(document, 'createElement').and.returnValue(mockAnchor);

      component.audioBlob = blob;
      component.audioIndex = 1;

      component.download();

      expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
      expect(mockAnchor.download).toBe('recording1.wav'); // Verifica el nombre del archivo
      expect(mockAnchor.href).toBe('blob:http://example.com'); // Verifica la URL asignada
      expect(clickSpy).toHaveBeenCalled(); // Verifica que se haya simulado el click
    });
  });

  describe('isWordActive', () => {
    it('debería devolver true si la palabra está activa en el rango actual', () => {
      component.waveSurfer = { getCurrentTime: () => 5 };
      const alignment = { word: 'hola', start: 4, end: 6 };

      expect(component.isWordActive(alignment)).toBeTrue();
    });

    it('debería devolver false si la palabra no está activa en el rango actual', () => {
      component.waveSurfer = { getCurrentTime: () => 3 };
      const alignment = { word: 'hola', start: 4, end: 6 };

      expect(component.isWordActive(alignment)).toBeFalse();
    });
  });
});
