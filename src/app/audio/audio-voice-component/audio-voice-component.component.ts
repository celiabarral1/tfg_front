import { Component, OnDestroy, OnInit } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import VAD from '../../@core/common/utils/vad.ts/vad';

@Component({
  selector: 'app-audio-voice-component',
  templateUrl: './audio-voice-component.component.html',
  styleUrl: './audio-voice-component.component.scss'
})
export class AudioVoiceComponent implements OnInit {
  private vad!: VAD;
  private wavesurfer!: WaveSurfer;
  private mediaRecorder!: MediaRecorder;
  private audioStream!: MediaStream;
  private silenceThreshold: number = 500;  // 500ms de umbral de silencio
  private recordingChunks: any[] = [];
  private mediaStreamSource!: MediaStreamAudioSourceNode;  // Fuente de audio para VAD

  constructor() { }

  ngOnInit(): void {
    this.setupAudio();
  }

  private async setupAudio() {
    try {
      // Obtener acceso al micrófono
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Crear un AudioContext para la fuente
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      // Convertir el MediaStream en un AudioNode
      this.mediaStreamSource = audioContext.createMediaStreamSource(this.audioStream);

      // Configuración para VAD
      const vadOptions = {
        source: this.mediaStreamSource,  // Ahora es un AudioNode
        context: audioContext,
        voice_start: () => this.startRecording(),
        voice_stop: () => this.stopRecording(),
        voice_stop_delay: 1000,  // Detiene la grabación después de 1 segundo de silencio
        energy_threshold_ratio_pos: 1.5,
        energy_threshold_ratio_neg: 0.5
      };

      // Crear instancia de VAD
      this.vad = new VAD(vadOptions);

      // Crear instancia de WaveSurfer
      this.wavesurfer = WaveSurfer.create({
        container: '#waveform',  // Asegúrate de tener un contenedor en el HTML con este id
        waveColor: 'violet',
        progressColor: 'purple',
        height: 128,
        barWidth: 3,
        cursorWidth: 1,
        cursorColor: 'black'
      });

      this.setupWaveSurfer();
    } catch (err) {
      console.error("Error al acceder al micrófono:", err);
    }
  }

  private setupWaveSurfer() {
    this.wavesurfer.on('ready', () => {
      console.log("WaveSurfer listo para mostrar la onda de audio");
    });

    this.wavesurfer.on('finish', () => {
      console.log("La grabación ha finalizado");
    });
  }

  private startRecording() {
    const mediaConstraints = { mimeType: 'audio/webm' };
    this.mediaRecorder = new MediaRecorder(this.audioStream, mediaConstraints);

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      this.recordingChunks.push(event.data);
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordingChunks, { type: 'audio/webm' });
      const audioURL = URL.createObjectURL(blob);
      this.wavesurfer.load(audioURL);
      this.recordingChunks = [];
    };

    this.mediaRecorder.start();
    console.log("Grabando audio...");
  }

  private stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      console.log("Grabación detenida");
    }
  }
}