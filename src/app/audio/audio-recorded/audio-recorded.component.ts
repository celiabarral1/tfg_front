import { AfterViewInit, Component, OnInit } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';  // Importar la librería WaveSurfer
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram.esm.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'

@Component({
  selector: 'app-audio-recorded',
  templateUrl: './audio-recorded.component.html',
  styleUrl: './audio-recorded.component.scss'
})
export class AudioRecordedComponent implements OnInit, AfterViewInit {
  private wavesurfer: any;

  ngOnInit(): void {
    // Inicializar WaveSurfer cuando el componente se crea
  }

  ngAfterViewInit(): void {
    // Crear y configurar WaveSurfer después de que el DOM se haya inicializado
    this.createWaveSurfer();
  }

  createWaveSurfer(): void {
    // Inicializar WaveSurfer y configurarlo
    this.wavesurfer = WaveSurfer.create({
      container: '#waveform',  // Contenedor donde se mostrará la onda
      waveColor: 'rgb(200, 0, 200)',
      progressColor: 'rgb(100, 0, 100)',
      url: 'audio/1729765769_1.wav', // Ruta del archivo de audio
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      sampleRate: 22050,
      plugins: [
        Spectrogram.create({
          labels: true,
          height: 200,
          splitChannels: true,
        }),
        RegionsPlugin.create() 
      ]
    });

    this.wavesurfer.on('ready', () => {
      console.log("LISTO")
      this.wavesurfer.addRegion({
        start: 1,  // Empezar en el segundo 1
        end: 3,    // Terminar en el segundo 2
        color: 'rgba(0, 255, 0, 0.5)',  // Color de la región
      });
      console.log("region")
    });

    this.wavesurfer.once('interaction', () => {
      this.wavesurfer.play();
    });

    
  }

  playPause(): void {
    this.wavesurfer.playPause();
  }
}
