import { Component } from '@angular/core';
import { RecordingEmotions } from '../audio-vad-live/model/recording-emotions';
import { CsvGestor } from '../../@core/common/utils/csv-gestor';

@Component({
  selector: 'app-csv-audios',
  templateUrl: './csv-audios.component.html',
  styleUrls: ['./csv-audios.component.scss']
})
export class CsvAudiosComponent {
  recordings: RecordingEmotions[] = [];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const csvGestor = new CsvGestor();
      csvGestor.loadCsvFile(file).then((data) => {
        this.recordings = data;
        // Asignar las rutas de los audios directamente
        this.loadAudioBlobs();
        console.log(this.recordings)
      }).catch((error) => {
        console.error('Error al cargar el archivo CSV:', error);
      });
    }
  }

  // Convertir las rutas de los audios a Blob
  async loadAudioBlobs(): Promise<void> {
    for (const recording of this.recordings) {
      const audioUrl = `audio/${recording.fileName}`; // Ruta del archivo
      try {
        const response = await fetch(audioUrl);
        const audioBlob = await response.blob(); // Convertir la URL en un Blob
        recording.audioBlob = audioBlob; // Asignar el Blob a audioBlob
        console.log(recording.audioBlob);
      } catch (error) {
        console.error('Error al cargar el audio:', error);
      }
    }
  }
  

}
