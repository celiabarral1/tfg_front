import { Component, Input, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import { Alignment } from '../model/alignment';
import { AuthService } from '../../../authentication/auth-services';

/**
 * Componente dedicado a la gestión y visualización de un audio y sus datos emocionales asociados.
 * Para ello utiliza la librería WaveSurfer.js.
 */
@Component({
  selector: 'app-audio-emotions',
  templateUrl: './audio-emotions.component.html',
  styleUrl: './audio-emotions.component.scss'
})
export class AudioEmotionsComponent implements OnChanges, AfterViewInit {
  /**
   * Propiedad para identificar si el perfil de la aplicación puede acceder a ciertas funcionalidades.
   */
  private isAuthorized: boolean = false;

  /**
   * Propiedad de entrada que es un blob de audio, el cuál posteriormente se visualizará.
   * @decorator @Input
   * El signo ! denota que es una propiedad obligatoria.
   */
  @Input() audioBlob!: Blob;

  /**
   * 
   */
  @Input() audioIndex : number | undefined;

  /**
   * Estructura que contiene los datos de la transcripción del audio y su alineación temporal con el mismo.
   */
  @Input() alignments: Alignment[] = [];

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
  private waveSurfer: any;
  
  /**
   * Constructor del componente.
   * @param changeDetector servicio que gestiona en tiempo real los cambios en los datos.
   * @param authService servicio para gestionar la autenticación de usuarios.
   */
  constructor(
    private changeDetector: ChangeDetectorRef,
    private authService: AuthService
  ) {}
  
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
    this.isAuthorized = this.authService.isAuthorized('admin', 'psychologist');
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
    if (this.audioBlob && this.waveformContainer) {
      const recordedUrl = URL.createObjectURL(this.audioBlob);

      this.waveSurfer = WaveSurfer.create({
        container: this.waveformContainer.nativeElement, // Contenedor donde se renderiza la forma de onda.
        waveColor: 'rgb(204, 102, 0)', // Color de la onda.
        progressColor: 'rgb(100, 50, 0)', // Color del progreso de reproducción.
        url: recordedUrl, // URL del archivo de audio que se reproducirá.
        barWidth: 2, // Ancho de las barras de la forma de onda.
        barGap: 1, // Espaciado entre las barras.
        barRadius: 2, // Radio de las barras.
        plugins: [RegionsPlugin.create()], // Plugins adicionales, como las regiones de la forma de onda.
      });

      this.waveSurfer.on('audioprocess', () => {
        this.changeDetector.detectChanges(); // Actualizar la vista.
      });

    } else {
      console.error('audioBlob o waveformContainer no están definidos');
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
    return currentTime >= alignment.start && currentTime <= alignment.end;
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
      downloadLink.download = `recording` + this.audioIndex +`.${this.audioBlob.type.split('/')[1] || 'webm'}`;
      downloadLink.click();
    }
  }

}
