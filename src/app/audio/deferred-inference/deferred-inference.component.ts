import { ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, ViewChild, ViewContainerRef } from '@angular/core';
import { RecordingEmotions } from '../audio-vad-live/model/recording-emotions';
import { CsvGestor } from '../../@core/common/utils/csv-gestor';
import { Alignment } from '../audio-vad-live/model/alignment';
import { AudioEmotionsComponent } from '../audio-vad-live/audio-emotions/audio-emotions.component';
import { AudioService } from '../audio.service';
import { AudioUtils } from '../../@core/common/utils/audio-helper';
import { lastValueFrom } from 'rxjs';
import { ForceAlignmentService } from '../force-alignment/force-alignment.service';

@Component({
  selector: 'app-deferred-inference',
  templateUrl: './deferred-inference.component.html',
  styleUrl: './deferred-inference.component.scss'
})
export class DeferredInferenceComponent {

  /**
   * Propiedad que representa el elemento del HTML que contiene las grabaciones que se obtienen en tiempo real.
   */
  @ViewChild('recordings', { static: true }) recordingsRef!: ElementRef;

  recordings: RecordingEmotions[] = [];

  audios: File[] = [];

    /**
     * Instancia de la clase que gestiona las conversiones de tipo de audios.
     */
    private audioUtils: AudioUtils = new AudioUtils();

      /**
   * Estructura que almacena las grabaciones de WaveSurfer
   */
  waveSurferRecorded: any[] = [];

    index=0;

      /**
   * Lista de audios asociados con sus datos emocionales.
   */
  recordingsWithEmotions: RecordingEmotions[] = [];

    /**
   * Estructura de datos en forma de cola para gestionar en orden las peticiones de procesamiento en tiempo real 
   * de los audios.
   */
  private requestQueue: (() => Promise<void>)[] = [];
  /**
   * Determina si hay o no alguna petición siendo resuelta.
   */
  private isRequestInProgress = false;
  

  constructor(
    private readonly audioService: AudioService,
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
        private forceAlignment: ForceAlignmentService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Método que maneja la subida de archicos.
   * Hace uso del CSVGestor, que transforma los datos subidos en Records
   * @param event 
   */
  onChargeAudios(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const inputAudios = Array.from(input.files);
      const invalidFiles = inputAudios.filter(file => file.type !== 'audio/wav');

      if (invalidFiles.length > 0) {
        console.log("Formato incorrecto");
        return;
      }
      this.audios = inputAudios;

      if(this.audios && this.audios.length > 0) {
        this.audios.forEach(a => this.processRecordedAudio(a));
      }
    }
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

    async sendAudioToGetEmotions(blob: Blob, componentRef: any): Promise<void> {
    const request = async () => {
      const audioData = new FormData();
      const fileName = 'recording' + this.index + '.wav';
      const audioFile = new File([blob], fileName, { type: blob.type });
  
      audioData.append('audioFile', audioFile);
  
      try {
        const response = await this.audioService.getDataAudio(audioData).toPromise();
              console.log('Audio enviado exitosamente:', response);
        
              // Mostrar emociones apenas se reciban
              const emocategoric = response.emotions.emocategoric;
              this.addCategoric(emocategoric, componentRef.instance);
              const emodimensional = response.emotions.emodimensional;
              this.addDimensional(emodimensional, componentRef.instance);
        
              // Crear objeto parcial de recording sin alignments (placeholder vacío)
              const recordingWithEmotion = await this.createRecordingWithEmotion(
                fileName,
                emocategoric,
                emodimensional,
                response.userId,
                blob,
                response.transcription,
                [] // alignments aún no disponibles
              );
              this.recordingsWithEmotions.push(recordingWithEmotion);
        
              // SEGUNDA PETICIÓN: obtener alignments
              const alignmentsResponse = await lastValueFrom(this.forceAlignment.getForcedAlignment(audioData));
              const alignments = alignmentsResponse.map((alignment: any) =>
                new Alignment(alignment.end, alignment.start, alignment.word)
              );
        
              // Actualizar alignments en la interfaz y en el objeto ya creado
              componentRef.instance.alignments = alignments;
              recordingWithEmotion.alignments = alignments;

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
    console.log('antes de crear ', alignments)
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

  //---------------------------- HASTA AQUÍ FACTORIZAR CON AUDIO-VAD-LIVE----------------//

  // Convertir las rutas de los audios a Blob
  async extractData(): Promise<void> {
    for (const recording of this.recordings) {
      const audioUrl = `audio/${recording.fileName}`;
      try {
        const response = await fetch(audioUrl);
        const audioBlob = await response.blob();
        recording.audioBlob = audioBlob;
        if (recording.transcription) {
          console.log("love", recording.alignments)
          recording.alignments = this.processAlignments(recording.alignments);
        }
      } catch (error) {
        console.error('Error al cargar el audio:', error);
      }
    }
  }

  /**
   * Procesa los alineamientos obtenidos del csv para parsearlos al modelo de datos correspondiente,
   * Alignment
   */
  processAlignments(alignments: Alignment[]): Alignment[] {
    const alignments_final: Alignment[] = [];
    alignments.forEach(a => {
      const word = a.word;
      const start = parseFloat(a.start.toString());
      const end = parseFloat(a.end.toString());
      alignments_final.push({ end, start, word });
    });
    return alignments_final;
  }

}
