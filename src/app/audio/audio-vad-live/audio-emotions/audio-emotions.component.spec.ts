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


fdescribe('AudioEmotionsComponent', () => {
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

    // Mockea de WaveSurfer
    component.waveformContainer = {
      nativeElement: document.createElement('div'),
    } as ElementRef;

    component.isAuthorized = true;

    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

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

    it('llamar a createWaveSurfer cuando audioBlob cambia', () => {
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


    it('debería inicializar WaveSurfer con el audioBlob', () => {
      spyOn(WaveSurfer, 'create').and.returnValue(mockWaveSurferInstance as unknown as WaveSurfer);
      component.audioBlob = new Blob(['test audio'], { type: 'audio/wav' });
      component.createWaveSurfer();

      expect(WaveSurfer.create).toHaveBeenCalled();
    });


    it('repodrucir o parar en la instancia de WaveSurfer', () => {
      component.waveSurfer = { playPause: jasmine.createSpy() };

      component.playPause();

      expect(component.waveSurfer.playPause).toHaveBeenCalled();
    });


    it('debería descargar el archivo de audio con el índice y extensión correctos', () => {
      const blob = new Blob(['test audio'], { type: 'audio/wav' });
      const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:http://prueba.com');
      
      const mockAnchor = document.createElement('a');
      const clickSpy = spyOn(mockAnchor, 'click');
      spyOn(document, 'createElement').and.returnValue(mockAnchor);

      component.audioBlob = blob;
      component.audioIndex = 1;

      component.download();

      expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
      expect(mockAnchor.download).toBe('recording1.wav'); 
      expect(clickSpy).toHaveBeenCalled(); 
    });


});
