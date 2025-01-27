import { Component, Input, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import { Alignment } from '../model/alignment';

@Component({
  selector: 'app-audio-emotions',
  templateUrl: './audio-emotions.component.html',
  styleUrl: './audio-emotions.component.scss'
})
export class AudioEmotionsComponent implements OnChanges, AfterViewInit {
  @Input() audioBlob?: Blob;
  @Input() audioIndex : number | undefined;
  @Input() alignments: Alignment[] = [];
  @Input() set emotions_categoric(value: any[]) {
    this._emotions_categoric = value;

    this._emotions_categoric.forEach(emotion => {
      emotion.colorClass = `color-${emotion.emo.toLowerCase()}`;
    });
    
    this.changeDetector.detectChanges(); // Forzar la detección de cambios
    
    // this.updateBackgroundGradient();
  }
  get emotions_categoric(): any[] {
    return this._emotions_categoric;
  }
  @Input() set emotions_dimensional(value: any) {
    // Verifica si `value` es un objeto y no un arreglo
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Convierte el objeto en un formato procesable como arreglo
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
  
  @ViewChild('waveformContainer', { static: true }) waveformContainer?: ElementRef;

  private waveSurfer: any;
  

  constructor(private changeDetector: ChangeDetectorRef) {}
  
  // Para las grabaciones tiempo real
  ngAfterViewInit(): void {
    if (this.audioBlob) {
      this.createWaveSurfer();
    } 
  }

  // Para la subida de audios
  ngOnChanges(changes: SimpleChanges): void {
    // Verificar si 'audioBlob' ha cambiado
    if (changes['audioBlob'] && this.audioBlob) {
      this.createWaveSurfer();
    }
  }
  

  createWaveSurfer(): void {
    if (this.audioBlob && this.waveformContainer) {
      const recordedUrl = URL.createObjectURL(this.audioBlob);

      this.waveSurfer = WaveSurfer.create({
        container: this.waveformContainer.nativeElement,
        waveColor: 'rgb(204, 102, 0)',
        progressColor: 'rgb(100, 50, 0)',
        url: recordedUrl,
        barWidth: 2,
        // Optionally, specify the spacing between bars
        barGap: 1,
        // And the bar radius
        barRadius: 2,
        plugins: [RegionsPlugin.create()],
      });

      this.waveSurfer.on('audioprocess', () => {
        this.changeDetector.detectChanges(); // Actualizar la vista
      });

    } else {
      console.error('audioBlob o waveformContainer no están definidos');
    }
  }

  isWordActive(alignment: Alignment): boolean {
    if (!this.waveSurfer) return false;
    const currentTime = this.waveSurfer.getCurrentTime();
    return currentTime >= alignment.start && currentTime <= alignment.end;
  }
  

  playPause(): void {
    this.waveSurfer.playPause();
  }

  download(): void {
    console.log(this.emotions_dimensional)
    if (this.audioBlob) {
      const recordedUrl = URL.createObjectURL(this.audioBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = recordedUrl;
      downloadLink.download = `recording` + this.audioIndex +`.${this.audioBlob.type.split('/')[1] || 'webm'}`;
      downloadLink.click();
    }
  }

  // Función para actualizar el fondo con un degradado basado en las emociones
  // updateBackgroundGradient(): void {
  //   if (this._emotions_categoric.length > 0) {
  //     const colors = this._emotions_categoric.map(emotion => {
  //       return this.getEmotionColor(emotion.emo); // Obtener el color de la emoción
  //     });

  //     // const gradient = `linear-gradient(180deg, ${colors.join(', ')}, rgba(255, 255, 255, 0.3))`;

  //     const gradient = `linear-gradient(180deg, ${colors[0]} 60%, ${colors[1]} 80%, ${colors[2]} 100%, rgba(255, 255, 255, 0.3) 100%)`;
  //     const emotionsContainer = document.querySelector('.emotions-container');
  //     if (emotionsContainer) {
  //       emotionsContainer.setAttribute('style', `background: ${gradient};`);
  //     }
  //   }
  // }

  // Función para mapear emociones a colores
  getEmotionColor(emo: string): string {
    switch (emo.toLowerCase()) {
      case 'happiness':
        return '#FFEB3B'; // Amarillo
      case 'sadness':
        return '#A2C2E1'; // Azul
      case 'anger':
        return '#FF7F7F'; // Rojo
      case 'fear':
        return '#A8D5BA'; // Verde
      case 'disgust':
        return '#877459'; // Verde amarronado
      case 'neutral':
        return '#FFF8E7'; // Beige
      default:
        return '#FFF8E7'; // Color por defecto
    }
  }
}
