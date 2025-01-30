import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AudioVadLiveComponent } from './audio-vad-live.component';
import { AudioService } from '../audio.service';
import { AuthService } from '../../authentication/auth-services';
import { ChangeDetectorRef, ElementRef, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';
import { AudioUtils } from '../../@core/common/utils/audio-helper';
import { RecordingEmotions } from './model/recording-emotions';
import { CsvGestor } from '../../@core/common/utils/csv-gestor';
import { of } from 'rxjs';

class MockAuthService {
  isAuthorized(...roles: string[]): boolean {
    return true; // Mock para evitar cambios en la vista
  }
}

describe('AudioVadLiveComponent', () => {
  let component: AudioVadLiveComponent;
  let fixture: ComponentFixture<AudioVadLiveComponent>;
  let mockAuthService: MockAuthService;
  let mockAudioService: jasmine.SpyObj<AudioService>;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();
    mockAudioService = jasmine.createSpyObj('AudioService', ['insertAudio']);

    await TestBed.configureTestingModule({
      declarations: [AudioVadLiveComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AudioService, useValue: mockAudioService },
        ChangeDetectorRef,
        ViewContainerRef,
        ComponentFactoryResolver
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AudioVadLiveComponent);
    component = fixture.componentInstance;

    // Mockear referencias a elementos del DOM
    component.waveformRef = { nativeElement: document.createElement('div') } as ElementRef;
    component.recordingsRef = { nativeElement: document.createElement('div') } as ElementRef;

    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debería inicializar WaveSurfer y verificar permisos de usuario', () => {
      spyOn(component, 'createWaveSurfer');

      component.ngOnInit();

      expect(component.createWaveSurfer).toHaveBeenCalled();
      expect(component.isAuthorized).toBeTrue();
    });
  });

  describe('ngOnDestroy', () => {
    it('debería detener la grabación y destruir WaveSurfer', () => {
      spyOn(component, 'stopRecording');
      spyOn(component, 'destroyWaveSurfer');

      component.ngOnDestroy();

      expect(component.stopRecording).toHaveBeenCalled();
      expect(component.destroyWaveSurfer).toHaveBeenCalled();
    });
  });
  describe('createWaveSurfer', () => {
    it('debería inicializar WaveSurfer con configuración específica', () => {
      const mockWaveSurferInstance = {
        registerPlugin: jasmine.createSpy('registerPlugin').and.returnValue({
          on: jasmine.createSpy('on'),
        }),
        destroy: jasmine.createSpy('destroy'),
      };
  
      spyOn(WaveSurfer, 'create').and.returnValue(mockWaveSurferInstance as unknown as WaveSurfer);
  
      component.createWaveSurfer();
  
      expect(WaveSurfer.create).toHaveBeenCalled();
    });
  
    afterEach(() => {
      if (component.waveSurfer) {
        component.waveSurfer.destroy();
        component.waveSurfer = null;
      }
    });
  });
  
  describe('stopRecording', () => {
    it('debería detener la grabación y cerrar el AudioContext', async () => {
      component.isRecording = true;
      component.audio = { stopRecording: jasmine.createSpy('stopRecording') };
      component.audioContext = new AudioContext(); // Asegurar que audioContext no sea null
  
      spyOn(component.audioContext, 'close').and.returnValue(Promise.resolve());
  
      await component.stopRecording(); // Esperar la promesa
  
      expect(component.isRecording).toBeFalse();
      expect(component.audio.stopRecording).toHaveBeenCalled();
      expect(component.audioContext.close).toHaveBeenCalled();
    });
  });
  

  describe('downloadAll', () => {
    it('debería descargar todos los audios grabados y generar un CSV', () => {
      const mockBlob = new Blob(['test audio'], { type: 'audio/wav' });
      component.waveSurferRecorded = [mockBlob];
      const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:http://example.com');
      spyOn(document, 'createElement').and.callFake(() => {
        const mockAnchor = document.createElement('a');
        spyOn(mockAnchor, 'click');
        return mockAnchor;
      });
      spyOn(CsvGestor, 'downloadCsv');

      component.downloadAll();

      expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob);
      expect(CsvGestor.downloadCsv).toHaveBeenCalledWith(component.recordingsWithEmotions, 'recordings_emotions');
    });
  });
});
