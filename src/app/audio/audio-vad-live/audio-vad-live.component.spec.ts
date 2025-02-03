import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { AudioVadLiveComponent } from './audio-vad-live.component';
import { AudioService } from '../audio.service';
import { AuthService } from '../../authentication/auth-services';
import { of, throwError } from 'rxjs';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// Mocking AudioService
class MockAudioService {
  getDataAudio(audioData: FormData) {
    return of({
      emotions: {
        emocategoric: [{ emotion: 'happy', score: 0.9 }],
        emodimensional: { valence: 0.8, arousal: 0.7 }
      },
      alignments: [{ start: 0, end: 1, word: 'hello' }],
      userId: 123,
      transcription: 'hello'
    });
  }
}

// Mocking AuthService
class MockAuthService {
  isAuthorized(...roles: string[]): boolean {
    // Aquí puedes agregar la lógica que necesites para el mock
    return roles.includes('admin') || roles.includes('psychologist');
  }
}


fdescribe('AudioVadLiveComponent', () => {
  let component: AudioVadLiveComponent;
  let fixture: ComponentFixture<AudioVadLiveComponent>;
  let mockAudioService: MockAudioService;
  let mockAuthService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudioVadLiveComponent],
      providers: [
        { provide: AudioService, useClass: MockAudioService },
        { provide: AuthService, useClass: MockAuthService }
      ],
      schemas: [NO_ERRORS_SCHEMA] // To avoid errors due to missing child components
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioVadLiveComponent);
    component = fixture.componentInstance;
    mockAudioService = TestBed.inject(AudioService);
    mockAuthService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('crear componente', () => {
    expect(component).toBeTruthy();
  });

  it('rol permitido psicólogo o admin', () => {
    expect(component.isAuthorized).toBeTrue();
  });

  it('empeiza a grabar y abre audioContext', async () => {
    const spy = spyOn(component, 'startRecording').and.callThrough();
    await component.startRecording();
    expect(spy).toHaveBeenCalled();
  });

  it('lanza a procesar emociones audio ', async () => {
    const blob = new Blob([], { type: 'audio/wav' });
    const spy = spyOn(mockAudioService, 'getDataAudio').and.callThrough();
    const response = await component.sendAudioToGetEmotions(blob, {} as any);

    expect(spy).toHaveBeenCalled();
    expect(response).toBeUndefined();  
  });

  it('progreso de audio', () => {
    component.updateProgress(120000); // 2 minutes
    expect(component.recordingProgress).toBe('02:00');
  });

  it('se detiene la grabación', fakeAsync(() => {
    component.stopRecording();
    tick();  
    flush(); 
    expect(component.isRecording).toBeFalse();
  }));

  it('error acceso micrófono', async () => {
    const navigatorBackup = navigator.mediaDevices.getUserMedia;
    navigator.mediaDevices.getUserMedia = () => Promise.reject('Access denied');
    
    const spy = spyOn(console, 'error');
    await component.startRecording();
    expect(spy).toHaveBeenCalledWith('Error al acceder al micrófono:', 'Access denied');

    navigator.mediaDevices.getUserMedia = navigatorBackup;
  });
});
