import { Component, OnInit, ElementRef, ViewChild, Inject, OnDestroy, ViewContainerRef, ComponentFactoryResolver, ChangeDetectorRef } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';
import { AudioService } from '../audio.service';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { ColorGenerator } from '../../@core/common/utils/color-generator'; 
import VAD from '../../@core/common/utils/vad.ts/vad'; 
import { AudioEmotionsComponent } from './audio-emotions/audio-emotions.component';
import { AudioUtils } from '../../@core/common/utils/audio-helper';
import { RecordingEmotions } from './model/recording-emotions';
import { CsvGestor } from '../../@core/common/utils/csv-gestor';
import * as annyang from 'annyang';
import { Alignment } from './model/alignment';

@Component({
  selector: 'app-audio-vad-live',
  templateUrl: './audio-vad-live.component.html',
  styleUrl: './audio-vad-live.component.scss'
})
export class AudioVadLiveComponent implements OnInit, OnDestroy {
  @ViewChild('waveform', { static: true }) waveformRef!: ElementRef;
  @ViewChild('recordings', { static: true }) recordingsRef!: ElementRef;

  private waveSurfer: any = null;
  private record: any = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private vad: VAD | null = null;
  private audioUtils: AudioUtils = new AudioUtils();

  scrollingWaveform = false;
  continuousWaveform = true;
  isRecording = false;
  recordingProgress = '00:00';
  colorGenerator = new ColorGenerator();

  index=0;

  waveSurferRecorded: any[] = [];

  private requestQueue: (() => Promise<void>)[] = [];
  private isRequestInProgress = false;
  private isRestartingRecording = false;
  
  recordingsWithEmotions: RecordingEmotions[] = [];

  voice_stop_delay = 500;
  fftSize = 1024;
  bufferLen = 1024;


  constructor(
    private readonly service: AudioService,
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.createWaveSurfer();
    // this.startRecording();
  }

  ngOnDestroy(): void {
    this.stopRecording();
    if (this.waveSurfer) {
      this.waveSurfer.destroy();
      this.waveSurfer = null;
    }
    this.requestQueue = [];
  }

  createWaveSurfer(): void {
    this.waveSurfer = WaveSurfer.create({
      container: this.waveformRef.nativeElement,
      waveColor: 'rgb(97, 80, 234)' ,
      progressColor: 'rgb(100, 0, 100)',
      height: 300,// Para hacerlo responsivo si es necesario
    });
  
    this.record = this.waveSurfer.registerPlugin(
      RecordPlugin.create({
        renderRecordedAudio: true, // No renderizamos el audio grabado en la visualización
        continuousWaveform: false,  // Para mantener la visualización continua
      })
    );
  
    this.record.on('record-end', (blob: Blob) => {
      this.processRecordedAudio(blob); // Procesa la grabación cuando termina
    });
  
    this.record.on('record-progress', (time: number) => {
      this.updateProgress(time); 
    });

    console.log('WaveSurfer creado.');
  }
  

  destroyWaveSurfer(): void {
    if (this.waveSurfer) {
      this.waveSurfer.destroy();
      this.waveSurfer = null;
      console.log('WaveSurfer destruido.');
    }
  }
  
  closeAudioContext(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      console.log('AudioContext cerrado.');
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
      console.log('MediaStream detenido.');
    }
  }

  
  async startRecording(): Promise<void> {
    this.stopRecording(); // Detenemos cualquier grabación previa
    this.destroyWaveSurfer(); // Destruimos la instancia actual
    this.createWaveSurfer(); // Creamos una nueva instancia de WaveSurfer
    this.closeAudioContext(); // Cerramos el contexto de audio previo
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaStream = stream;
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const sourceNode = this.audioContext.createMediaStreamSource(stream);

      // Aclaración parámetros:
      // fftSize: 1024 -> Transformada Rápida de Fourier (FFT). Convierte la señal de audio en el dominio del tiempo a una representación en el dominio de la frecuencia.
      // 1024 
      this.vad = new VAD({
        source: sourceNode,
        context: this.audioContext,
        fftSize: 1024,
        bufferLen: 1024,
        voice_start: () => {
          console.log('Voz detectada');
          if (!this.isRecording) {
            this.isRecording = true;
            this.record.startRecording(); // Inicia la grabación cuando se detecta voz
          }
        },
        voice_stop: () => {
          console.log('Silencio detectado, finalizando grabación actual');
          if (this.isRecording) {
            this.record.stopRecording(); // Detiene la grabación cuando se detecta silencio
            this.isRecording = false;
            this.destroyWaveSurfer();
            this.createWaveSurfer(); // Reinicia la visualización si es necesario
          }
        },
        voice_stop_delay: 20000, // Retraso para detectar silencio
      });
  
  
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
    }
  }
  


  stopRecording(): void {
    if (this.isRecording) {
      this.isRecording = false;
      this.record.stopRecording();
    }
  
    // Cerrar el AudioContext si está abierto
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().then(() => {
        console.log('AudioContext cerrado correctamente.');
      }).catch((error) => {
        console.error('Error al cerrar el AudioContext:', error);
      });
    }
    this.audioContext = null;
  
    // Detener y liberar el MediaStream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    
    console.log('Grabación detenida manualmente.');
  }

  updateProgress(time: number): void {
    const formattedTime = [
      Math.floor((time % 3600000) / 60000), // minutos
      Math.floor((time % 60000) / 1000), // segundos
    ]
      .map((v) => (v < 10 ? '0' + v : v))
      .join(':');
    this.recordingProgress = formattedTime;
  }

  async processRecordedAudio(blob: Blob): Promise<void> {
    // const wavBlob = await this.audioUtils.convertBlobToWav(blob); 
    // Convertir el audio grabado a WAV
    this.audioUtils.convertBlobToWav(blob).then((wav) => {
      this.waveSurferRecorded.push(wav);
      const container = this.recordingsRef.nativeElement;

      // Crear el componente dinámicamente
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(AudioEmotionsComponent);
      const componentRef = this.viewContainerRef.createComponent(componentFactory);
      
      // Pasar las propiedades al componente
      componentRef.instance.audioBlob = wav; 
      componentRef.instance.audioIndex = this.index; 
      // Pasar las emociones correspondientes

      // Agregar el componente al DOM
      container.appendChild(componentRef.location.nativeElement);
      this.sendAudioToGetEmotions(wav, componentRef);
    });

    this.index++;
    
  }

  // EMOTIONS PROCESS

  async sendAudioToGetEmotions(blob: Blob, componentRef: any): Promise<void> {
    const request = async () => {
      const formData = new FormData();
      const fileName = 'recording' + this.index + '.wav';
      const audioFile = new File([blob], fileName, { type: blob.type });
  
      formData.append('audioFile', audioFile);
  
      try {
        const response = await this.service.insertAudio(formData).toPromise();
        console.log('Audio enviado exitosamente:', response);

        
        const emocategoric = response.emotions.emocategoric;
        this.addCategoric(emocategoric, componentRef.instance);
        const emodimensional = response.emotions.emodimensional;
        this.addDimensional(emodimensional, componentRef.instance);
        const alignmentsResponse = response.alignments;
        const alignments = alignmentsResponse.map((alignment: [string, number, number]) => {
          return new Alignment(alignment[0], alignment[1], alignment[2]);
        });

        componentRef.instance.alignments = alignments;

        const recordingWithEmotion = this.createRecordingWithEmotion(fileName,emocategoric,emodimensional,response.userId,blob,
          response.transcription);

        // Agregar el objeto al arreglo
        this.recordingsWithEmotions.push(await recordingWithEmotion);

        console.log(recordingWithEmotion)
      } catch (error) {
        console.error('Error al enviar el audio:', error);
      }
    };
  
    this.enqueueRequest(request);
  }

  addCategoric(emocategoric: any, instance: any) {
    if (emocategoric && Array.isArray(emocategoric)) {
      instance.emotions_categoric = emocategoric;
    } else {
      console.error('No se recibieron emociones categóricas válidas.');
    }
  }

  addDimensional(emodimensional: any, instance: any) {
    if (emodimensional) {
      instance.emotions_dimensional = emodimensional;
    } else {
      console.error('No se recibieron emociones dimensionales válidas.');
    }
  }

  async createRecordingWithEmotion(
    fileName: string,
    emocategoric: any[],
    emodimensional: any,
    userId: number,
    audioBlob: Blob,
    transcription: string
  ): Promise<RecordingEmotions> {
    // const audioBase64 = await this.audioUtils.convertBlobToBase64(audioBlob); // Convertir el blob a base64
  
    return new RecordingEmotions({
      fileName: fileName,
      Emotion_1_label: emocategoric[0]?.emo || '',
      Emotion_1_mean: emocategoric[0]?.prob || 0,
      Emotion_1_std: emocategoric[0]?.std || 0,
      Emotion_2_label: emocategoric[1]?.emo || '',
      Emotion_2_mean: emocategoric[1]?.prob || 0,
      Emotion_2_std: emocategoric[1]?.std || 0,
      Emotion_3_label: emocategoric[2]?.emo || '',
      Emotion_3_mean: emocategoric[2]?.prob || 0,
      Emotion_3_std: emocategoric[2]?.std || 0,
      valence: emodimensional.valence,
      arousal: emodimensional.arousal,
      dominance: emodimensional.dominance,
      userId: userId,
      timestamp: Date.now(),
      // audioBlob: audioBase64,  // Almacenar la cadena base64
      audioBlob:audioBlob,
      transcription: transcription,
    });
  }
  
  
  
  // GESTION DE LA COLA DE PETICIONES
  private async enqueueRequest(request: () => Promise<void>): Promise<void> {
    this.requestQueue.push(request);
  
    if (!this.isRequestInProgress) {
      this.processQueue();
    }
  }
  
  private async processQueue(): Promise<void> {
    if (this.isRequestInProgress || this.requestQueue.length === 0) {
      return;
    }
  
    this.isRequestInProgress = true;
  
    const nextRequest = this.requestQueue.shift();
    if (nextRequest) {
      try {
        await nextRequest();
      } finally {
        this.isRequestInProgress = false;
        this.processQueue(); // Procesa la siguiente solicitud en la cola
      }
    }
  }
  
  // descarga de audios
  downloadAll(): void {
    if (this.waveSurferRecorded.length === 0) {
      console.warn('No hay audios grabados para descargar.');
      return;
    }
  
    this.waveSurferRecorded.forEach((audioBlob, index) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const anchor = document.createElement('a');
      anchor.href = audioUrl;
      anchor.download = `recording${index + 1}.wav`; // Nombre del archivo
      anchor.click();
      URL.revokeObjectURL(audioUrl); // Limpia el objeto URL
    });
  
    CsvGestor.downloadCsv(this.recordingsWithEmotions);
    
    console.log('Todos los audios han sido descargados.');
  }

  
  // showEmotions(response: any) {
  //   console.log(this.waveSurferRecorded)
  //   this.waveSurferRecorded.forEach((waveSurferInstance) => {
  //     const regions = waveSurferInstance.plugins[0]
  //     console.log("Regions Plugin:", waveSurferInstance.plugins[0]); 

  //     if (regions) {
  //       console.log("Plugin Regions cargado:", regions);

  //       // Agregar las emociones como regiones
  //       this.EMOTIONS_DATA.forEach((emotionArray) => {
  //         // Para cada subarray de emociones
  //         emotionArray.forEach((emotion) => {
  //           console.log(emotion);
  //           regions.addRegion({
  //             start: emotion.start,  // Comienzo de la región
  //             end: emotion.end,      // Fin de la región
  //             color: this.colorGenerator.randomColor(),  // Color aleatorio
  //             content: emotion.emotion,  // Etiqueta con el nombre de la emoción
  //             drag: false,
  //           });
  //         });
  //       });
        
  //     } else {
  //       console.log("Plugin Regions no está accesible.");
  //     }
  //   });
  // }
  
  
  
}
