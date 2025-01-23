import { Component } from '@angular/core';
import { RecordingEmotions } from '../audio-vad-live/model/recording-emotions';
import { CsvGestor } from '../../@core/common/utils/csv-gestor';
import { Alignment } from '../audio-vad-live/model/alignment';

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
        console.log("DATADATADATA", data);
        this.recordings = data;
        console.log(this.recordings , "QUEN PSAS")
        // Asignar las rutas de los audios directamente
        this.extractData();
        console.log(this.recordings)
      }).catch((error) => {
        console.error('Error al cargar el archivo CSV:', error);
      });
    }
  }

  // Convertir las rutas de los audios a Blob
  async extractData(): Promise<void> {
    for (const recording of this.recordings) {
      const audioUrl = `audio/${recording.fileName}`; // Ruta del archivo
      try {
        const response = await fetch(audioUrl);
        const audioBlob = await response.blob(); // Convertir la URL en un Blob
        recording.audioBlob = audioBlob; // Asignar el Blob a audioBlob
        console.log("HOLAAAAAAAAAAAAAAAAAAAAAA",recording)
        if (recording.transcription) {
          console.log("love" , recording.alignments)
          recording.alignments = this.processAlignments(recording.alignments);
        }
      } catch (error) {
        console.error('Error al cargar el audio:', error);
      }
    }
  }
  

  processAlignments(alignments: Alignment[]): Alignment[] {
    const alignments_final: Alignment[] = [];
    alignments.forEach(a => {
      const word = a.word; // accediendo correctamente a la propiedad 'word'
      const start = parseFloat(a.start.toString()); // asegurándose de convertir a número
      const end = parseFloat(a.end.toString()); // asegurándose de convertir a número
      alignments_final.push({ word, start, end }); // agregando el objeto procesado al array final
    });
    return alignments_final;
  }
  
}
