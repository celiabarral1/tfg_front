import { Component, OnInit, OnDestroy } from '@angular/core';
import VAD from '../../@core/common/utils/vad.ts/vad'; // Asegúrate de importar la clase VAD

@Component({
  selector: 'app-audio-vad',
  templateUrl: './audio-vad.component.html',
  styleUrls: ['./audio-vad.component.scss']
})
export class AudioVadComponent implements OnInit, OnDestroy {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private vad: VAD | null = null;
  private silenceTimeout: any;
  private silenceDuration: number = 5000; // 500ms de silencio para detener la grabación

  constructor() { }

  ngOnInit(): void {
    // Ya no pedimos el micrófono en ngOnInit, lo haremos después de la interacción del usuario.
  }

  ngOnDestroy(): void {
    this.stopRecording();
  }

  // Método para iniciar la grabación después de la interacción del usuario
  public startRecording(): void {
    this.requestMicrophonePermission();
  }

  private async requestMicrophonePermission(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaStream = stream;
      this.startRecordingStream(stream);
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
    }
  }

  private startRecordingStream(stream: MediaStream): void {
    // Crear el AudioContext solo después de la interacción del usuario
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Reanudar el AudioContext si es necesario
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        console.log("AudioContext reanudado.");
      });
    }

    const sourceNode = this.audioContext.createMediaStreamSource(stream);

    // Configurar las opciones para el VAD
    const vadOptions = {
      source: sourceNode,
      context: this.audioContext,
      fftSize: 512,  // Ajusta según tus necesidades
      bufferLen: 512,  // Ajusta según tus necesidades
      voice_start: () => {
        console.log('Voz detectada');
      },
      voice_stop: () => {
        console.log('Silencio detectado, deteniendo grabación');
        this.stopRecording();
      },
      voice_stop_delay: 5000,  // Ajusta el tiempo de espera para el silencio
    };

    // Crear la instancia de VAD
    this.vad = new VAD(vadOptions);
  }

  private stopRecording(): void {
    if (this.audioContext) {
      this.audioContext.close();
    }
    if (this.mediaStream) {
      const tracks = this.mediaStream.getTracks();
      tracks.forEach(track => track.stop());
    }
    console.log('Grabación detenida debido al silencio.');
  }
}
