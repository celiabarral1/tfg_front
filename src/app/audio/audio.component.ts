import { Component, OnInit, AfterViewInit } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';  // Importar la librería WaveSurfer
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram.esm.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'


@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent {
  
}
