import { Component, Input, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef, SimpleChanges, OnChanges, OnInit } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/plugins/regions';
import TimelinePlugin from 'wavesurfer.js/plugins/timeline';


import { Alignment } from '../model/alignment';
import { AuthService } from '../../../authentication/auth-services';
import { EmotionTranslationService } from '../../../shared/shared/emotions-translate.service';

/**
 * Componente dedicado a la gestión y visualización de un audio y sus datos emocionales asociados.
 * Para ello utiliza la librería WaveSurfer.js.
 */
@Component({
  selector: 'app-audio-emotions',
  templateUrl: './audio-emotions.component.html',
  styleUrl: './audio-emotions.component.scss'
})
export class AudioEmotionsComponent implements OnChanges, AfterViewInit, OnInit {
  /**
   * Propiedad para identificar si el perfil de la aplicación puede acceder a ciertas funcionalidades.
   */
  public isAuthorized: boolean = false;

  /**
   * Propiedad de entrada que es un blob de audio, el cuál posteriormente se visualizará.
   * @decorator @Input
   * El signo ! denota que es una propiedad obligatoria.
   */
  @Input() audioBlob!: Blob;

  /**
   * 
   */
  @Input() audioIndex: number | undefined;

  private isShowing: boolean = false;

  @ViewChild('timelineContainer', { static: true }) timelineContainer?: ElementRef;


  /**
   * Propiedad de entrada que recibe los `alignments` y los transforma si es necesario.
   * Se asegura de que cada objeto tenga `word`, `start` y `end` correctamente formateados.
   * @decorator @Input
   */
  @Input() set alignments(value: Alignment[]) {
    if (!value || !Array.isArray(value)) {
      console.error('alignments debe ser un array:', value);
      this._alignments = [];
      return;
    }
    console.log('valores ', value)
    // Procesar cada alignment
    this._alignments = value.map(a => ({
      word: a.word || '', // Asegurar que `word` es un string válido
      start: parseFloat(a.start?.toString()) || 0, // Convertir a número
      end: parseFloat(a.end?.toString()) || 0 // Convertir a número
    }));

    console.log('Alignments procesados:', this._alignments);

    this.showAlignment();

    this.changeDetector.detectChanges(); // Forzar actualización en la vista

    // if(this.waveSurfer) {

    //   this.showAlignment();
    // }
  }

  get alignments(): Alignment[] {
    return this._alignments;
  }

  /**
  * Propiedad de entrada que gestiona la lista de emociones categóricas del audio.
  * Cada emoción recibida se procesa para añadir una clase CSS basada en su nombre, lo que permite 
  * aplicar estilos dinámicos a los elementos relacionados.
  * @decorator @Input
   */
  @Input() set emotions_categoric(value: any[]) {
    this._emotions_categoric = value;

    this._emotions_categoric.forEach(emotion => {
      emotion.colorClass = `color-${emotion.emo.toLowerCase()}`;
    });

    this.changeDetector.detectChanges();
  }

  get emotions_categoric(): any[] {
    return this._emotions_categoric;
  }

  /**
  * Propiedad de entrada que gestiona la lista de emociones dimensionales del audio.
  * Cada emoción recibida se procesa para añadir una clase CSS, lo que permite 
  * aplicar estilos dinámicos a los elementos relacionados.
  * @decorator @Input
  * @throws {Error} si no se procesan correctamente las emociones dimensionales
   */
  @Input() set emotions_dimensional(value: any) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      this._emotions_dimensional = [
        { name: 'Arousal', value: value.arousal, colorClass: 'color-arousal' },
        { name: 'Dominance', value: value.dominance, colorClass: 'color-dominance' },
        { name: 'Valence', value: value.valence, colorClass: 'color-valence' }
      ];
    } else {
      console.error('Invalid value for emotions_dimensional:', value);
      this._emotions_dimensional = [];
    }

    console.log('Processed emotions_dimensional:', this._emotions_dimensional);
    this.changeDetector.detectChanges(); // Forzar la detección de cambios
  }


  get emotions_dimensional(): any[] {
    return this._emotions_dimensional;
  }

  private _emotions_categoric: any[] = [];
  private _emotions_dimensional: any[] = [];
  private _alignments: Alignment[] = [];

  /**
   * Representa al elemento del html asociado al componente que contendrá la forma de onda del audio.
   * `{ static: true }` indica que la referencia se resuelve cuando se carga el DOM, 
   * antes del ciclo de vida `ngAfterViewInit`.
   * @decorator @ViewChild
   */
  @ViewChild('waveformContainer', { static: true }) waveformContainer?: ElementRef;

  /**
   * 
   */
  public waveSurfer: any;

  /**
   * Constructor del componente.
   * @param changeDetector servicio que gestiona en tiempo real los cambios en los datos.
   * @param authService servicio para gestionar la autenticación de usuarios.
   */
  constructor(
    private changeDetector: ChangeDetectorRef,
    private authService: AuthService,
    private emotionTranslationService: EmotionTranslationService
  ) { }

  /**
   * Para que la primera detección de cambios, en este caso del rol 
   * del usuario, se actualice antes de cargar la vista.
   */
  ngOnInit(): void {
    this.isAuthorized = this.authService.isAuthorized('admin', 'psychologist');
  }

  /**
   * Una vez inicializadas las vistas del componente, se comprueba que haya un audio de tipo Blob 
   * y se llama al método para visualizar su onda.
   * También se recoge el valor de si un usuario está autorizado o no, en este caso si los perfiles
   * 'admin' y 'psychologist'
   */
  ngAfterViewInit(): void {
    if (this.audioBlob) {
      this.createWaveSurfer();
    }
  }

  /**
   * Cuando se detectan cambios en las propiedades:
   * audioBlob, para representar adecuadamente la onda de un nuevo audio.
   * @param changes contiene los cambios en las propiedades en forma de objeto
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['audioBlob'] && this.audioBlob) {
      this.createWaveSurfer();
    }

  }

  /**
   * Método que crea y configura la visualización de la onda asociada al audio que contiene la propiedad 'audioBlob'.
   * Verifica tanto el audioBlob se haya pasado como que el contenedor de onda se haya cargado correctamente en el DOM.
   * Genera a partir del audioBlob una URL para el navegador.
   * Mediante la librería WaveSurfer.js ajusta los parámetros para visualizar la onda.
   * Mientras el audio se procesa está sometido a detectar cambios.
   * @throws {Error} si alguna de las propiedades necesarias (audioBlob o waveformContainer) no están bien definidas.
   */
  createWaveSurfer(): void {
    if (this.audioBlob && this.waveformContainer && this.timelineContainer) {
      const recordedUrl = URL.createObjectURL(this.audioBlob);

      this.waveSurfer = WaveSurfer.create({
        container: this.waveformContainer.nativeElement,
        waveColor: 'rgb(204, 102, 0)',
        progressColor: 'rgb(100, 50, 0)',
        url: recordedUrl,
        barWidth: 2,
        barGap: 1,
        barRadius: 2
      });

      const regionsPlugin = this.waveSurfer.registerPlugin(RegionsPlugin.create());
      this.waveSurfer.regionsPlugin = regionsPlugin;

      const timelinePlugin = TimelinePlugin.create({
        container: this.timelineContainer.nativeElement,
        height: 25,
  timeInterval: 0.1,
  primaryLabelInterval: 1,
        style: {
          color: '#333',
          font: '16px Arial',
          fontWeight: 'normal'
        }
      });

      this.waveSurfer.registerPlugin(timelinePlugin);

      this.waveSurfer.on('audioprocess', () => {
        this.changeDetector.detectChanges();
      });

      this.waveSurfer.once('ready', () => {
  this.waveSurfer.zoom(100); // 👈 fuerza separación visual de segundos
});


      console.log('WaveSurfer plugins activos:', this.waveSurfer?.plugins);
    } else {
      console.error('audioBlob, waveformContainer o timelineContainer no están definidos');
    }
  }



  /**
   * Método para visualizar sobre el audio qué región temporal abarca cada palabra detectada.
   * @returns 
   */
  showAlignment(): void {
    if (!this.waveSurfer?.regionsPlugin) {
      console.error('El plugin de regiones no está disponible');
      return;
    }

    const plugin = this.waveSurfer.regionsPlugin;

    if (!this.isShowing) {
      this._alignments.forEach(alignment => {
        const isSilence = alignment.word.trim() === '';

        if (isSilence) {
          return;
        }

        const region = plugin.addRegion({
          start: alignment.start,
          end: alignment.end,
          color: 'rgba(255,255,255,0.7)',
          drag: false,
          resize: false
        });

        if (!isSilence && region.element) {
          const label = document.createElement('div');
          label.innerText = `${alignment.word}`;
          label.style.position = 'absolute';
          label.style.fontSize = '12px';
          label.style.color = 'black';
          label.style.backgroundColor = 'rgba(255,255,255,0.7)';
          label.style.borderRadius = '4px';
          label.style.padding = '2px 5px';
          label.style.left = '50%';
          label.style.top = '50%';
          label.style.transform = 'translate(-50%, -50%)';
          region.element.appendChild(label);
        }
      });

      this.isShowing = true;
    } else {
      // Object.values(plugin.getRegions()).forEach(region => region.remove());
      this.isShowing = false;
    }
  }


  /**
   * 
   * @param alignment 
   * @returns 
   */
  isWordActive(alignment: Alignment): boolean {
    if (!this.waveSurfer) return false;
    const currentTime = this.waveSurfer.getCurrentTime();
    return currentTime >= (alignment.start) && currentTime <= (alignment.end);
  }

  /**
   * Permite reproducir o detener la reproducción del audio de manera que se visualiza
   * la parte de la onda que le corresponde a cada momento del audio.
   */
  playPause(): void {
    this.waveSurfer.playPause();
  }

  /**
   * Se encarga de la descarga propia del audioBlob en local.
   * Genera una URL a partir del audio, crea dinámicamente un enlace de tipo <a> al que le asocia 
   * la URL creada y simula un click que inicia la descargar del archivo.
   */
  download(): void {
    if (this.audioBlob) {
      const recordedUrl = URL.createObjectURL(this.audioBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = recordedUrl;
      downloadLink.download = `recording` + this.audioIndex + `.${this.audioBlob.type.split('/')[1] || 'webm'}`;
      downloadLink.click();
    }
  }

  /**
   * Método para traducir la emoción al español
   */
  translateEmotion(emotion: string): string {
    return this.emotionTranslationService.translateEmotion(emotion);
  }
}
