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
import { AuthService } from '../../authentication/auth-services';

/**
 * Componente dedicado a la detección de voz en tiempo real y a la visualización de los datos asociados
 * a las grabaciones obtenidas.
 */
@Component({
  selector: 'app-audio-vad-live',
  templateUrl: './audio-vad-live.component.html',
  styleUrl: './audio-vad-live.component.scss'
})

export class AudioVadLiveComponent implements OnInit, OnDestroy {
  /**
   * Propiedad que representa el elemento del HTML que contiene la onda que se visualiza en tiempo real. 
   */
  @ViewChild('waveform', { static: true }) waveformRef!: ElementRef;
  /**
   * Propiedad que representa el elemento del HTML que contiene las grabaciones que se obtienen en tiempo real.
   */
  @ViewChild('recordings', { static: true }) recordingsRef!: ElementRef;

  /**
   * Propiedad para verificar que el usuario tengas permisos necesarios para las funcionalidades.
   */
  isAuthorized: boolean = false;

  /**
   * Instancia de WaveSurfer para para renderizar la forma de onda captada en tiempo real
   */
  public waveSurfer: any = null;
  /**
   * Audio
   */
  public audio: any = null;
  /**
   * Conteto de audio de la aplicación.
   */
  public audioContext: AudioContext | null = null;
  /**
   * Flujo de medios activo, obtenido del micrófono del usuario
   */
  private mediaStream: MediaStream | null = null;
  /**
   * Instancia de una librería que ofrece la gestión de detección de actividad en la voz.
   */
  private vad: VAD | null = null;
  /**
   * Instancia de la clase que gestiona las conversiones de tipo de audios.
   */
  private audioUtils: AudioUtils = new AudioUtils();

  /**
   * Propiedad que determina si se está grabando o no 
   */
  isRecording = false;
  recordingProgress = '00:00';

  index=0;

  /**
   * Estructura que almacena las grabaciones de WaveSurfer
   */
  waveSurferRecorded: any[] = [];

  /**
   * Estructura de datos en forma de cola para gestionar en orden las peticiones de procesamiento en tiempo real 
   * de los audios.
   */
  private requestQueue: (() => Promise<void>)[] = [];
  /**
   * Determina si hay o no alguna petición siendo resuelta.
   */
  private isRequestInProgress = false;
  
  /**
   * Lista de audios asociados con sus datos emocionales.
   */
  recordingsWithEmotions: RecordingEmotions[] = [];

  /**
   * Propiedades de configuración de la detección automática de voz.
   * @property {voice_stop_delay} tiempo de silencio para cortar una grabación y comenzar una nueva
   * @property {fftSize} tamaño de la frecuencia del audio
   * @property {'bufferLen} longitud de búfer de audio
   */
  voice_stop_delay = 500;
  fftSize = 1024;
  bufferLen = 1024;

  /**
   * Constructor del componente.
   * @param audioService serviciop para realizar peticiones relacionadas con el procesamiento y obtención de datos sobre un audio.
   * @param viewContainerRef representa la vista actual y es necesario para insertar componente dinámicamente.
   * @param componentFactoryResolver gestiona y crea dinámicamente instancias de componentes en tiempo de ejecución.
   * @param authService servicio para supervisar que el usuario forma parte del perfil con privilegios para las funcionalidades.
   */
  constructor(
    private readonly audioService: AudioService,
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private authService: AuthService
  ) {}

  /**
   * Cuando se inicializa el componente, se crea la onda de audio en tiempo real
   * y se verifica si el usuario tiene un rol adecuado.
   */
  ngOnInit(): void {
    this.createWaveSurfer();
    this.isAuthorized = this.authService.isAuthorized('admin', 'psychologist');
  }

  /**
   * Al destruirse el componente se detiene la grabación,
   * y se destruye la visualización de la onda en tiempo real.
   * Se elimina la cola de peticiones.
   */
  ngOnDestroy(): void {
    this.stopRecording();
    if (this.waveSurfer) {
      this.waveSurfer.destroy();
      this.waveSurfer = null;
    }
    this.requestQueue = [];
  }

  /**
   * Crea dinámicamente una instancia de WaveSurfer, en el contenedor del HTML asociado, con los parámetros visuales deseados.
   * Utiliza extensiones que ofrece la librería para ajustar más la visualización.
   * Cuando la onda termina, se procesa el audio que representa.
   * Mientras está grabando se muestra la duración de esa grabación.
   * 
   */
  createWaveSurfer(): void {
    this.waveSurfer = WaveSurfer.create({
      container: this.waveformRef.nativeElement,
      waveColor: 'rgb(97, 80, 234)' ,
      progressColor: 'rgb(100, 0, 100)',
      height: 500,// Para hacerlo responsivo si es necesario
    });
  
    this.audio = this.waveSurfer.registerPlugin(
      RecordPlugin.create({
        renderRecordedAudio: true, 
        continuousWaveform: false, 
      })
    );
  
    this.audio.on('record-end', (blob: Blob) => {
      this.processRecordedAudio(blob);
    });
  
    this.audio.on('record-progress', (time: number) => {
      this.updateProgress(time); 
    });

    console.log('WaveSurfer creado.');
  }
  
  /**
   * Destruye la onda de audio.
   */
  destroyWaveSurfer(): void {
    if (this.waveSurfer) {
      this.waveSurfer.destroy();
      this.waveSurfer = null;
      console.log('WaveSurfer destruido.');
    }
  }
  
  /**
   * Se encarga de cerrar bien todo lo relacionado con la capturación de audio mediante
   * el micrófono.
   */
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

  /**
   * Método @async que inicia la grabación y todo lo que ello conlleva.
   * Primero se encarga de destruir cualquier resto tanto visual como de micrófono que quede.
   * A continuación trata de solicitar acceso al micrófono del usuario, inicializa el contexto de audio y crea un nodo de origen de medios.
   * Se crea la instancia de VAD (detección de voz) que gestiona cuando comienza y se genera una grabación,
   * según lo largo que sea el silencio que detecta (en este caso cada silencio de 500ms). Mientras el micrófono continúa siempre en escucha, a caso de que se detenga explícitamente.
   * * @returns {Promise<void>} promesa que se resuelve cuando se inicializa correctamente el flujo de audio.
   * * @throws {Error} si el usuario niega el acceso al micrófono o si ocurre algún problema de acceso.
   */
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
            this.audio.startRecording(); // Inicia la grabación cuando se detecta voz
          }
        },
        voice_stop: () => {
          console.log('Silencio detectado, finalizando grabación actual');
          if (this.isRecording) {
            this.audio.stopRecording(); // Detiene la grabación cuando se detecta silencio
            this.isRecording = false;
            this.destroyWaveSurfer();
            this.createWaveSurfer(); // Reinicia la visualización si es necesario
          }
        },
        voice_stop_delay: 500, // Retraso para detectar silencio
      });
  
  
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
    }
  }
  

  /**
   * Detiene la grabación, tanto visualmente como cierra la escucha.
   * Cierra el micrófono y el contexto de audio si está abierto.
   * Detiene y libera el mediaStream si existe.
   */
  stopRecording(): void {
    if (this.isRecording) {
      this.isRecording = false;
      this.audio.stopRecording();
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
        .then(() => {
          console.log('AudioContext cerrado correctamente.');
          this.audioContext = null; 
        })
        .catch((error) => {
          console.error('Error al cerrar el AudioContext:', error);
        });
    } else {
      this.audioContext = null; // Si ya estaba cerrado, asegurarse de limpiarlo
    }
    
  
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

  /**
   * Función @async que gestiona el procesamiento de cada grabación
   * @param blob 
   */
  async processRecordedAudio(blob: Blob): Promise<void> {
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
      const audioData = new FormData();
      const fileName = 'recording' + this.index + '.wav';
      const audioFile = new File([blob], fileName, { type: blob.type });
  
      audioData.append('audioFile', audioFile);
  
      try {
        const response = await this.audioService.insertAudio(audioData).toPromise();
        console.log('Audio enviado exitosamente:', response);

        
        const emocategoric = response.emotions.emocategoric;
        this.addCategoric(emocategoric, componentRef.instance);
        const emodimensional = response.emotions.emodimensional;
        this.addDimensional(emodimensional, componentRef.instance);
        const alignmentsResponse = response.alignments;
        const alignments = alignmentsResponse.map((alignment: [string, number, number]) => {
          return new Alignment(alignment[0], alignment[1], alignment[2]);
        });

        console.log(alignments)
        componentRef.instance.alignments = alignments;

        const recordingWithEmotion = this.createRecordingWithEmotion(fileName,emocategoric,emodimensional,response.userId,blob,
          response.transcription,alignments);

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
    transcription: string,
    alignments: Alignment[] 
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
      alignments: alignments 
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
  
    console.log("tiene alignmets? ", this.recordingsWithEmotions)
    CsvGestor.downloadCsv(this.recordingsWithEmotions,'recordings_emotions');
    
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
