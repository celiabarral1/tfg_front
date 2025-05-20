import { Component } from '@angular/core';
import { RecordingEmotions } from '../audio-vad-live/model/recording-emotions';
import { CsvGestor } from '../../@core/common/utils/csv-gestor';
import { Alignment } from '../audio-vad-live/model/alignment';

@Component({
  selector: 'app-csv-audios',
  templateUrl: './csv-audios.component.html',
  styleUrls: ['./csv-audios.component.scss']
})
/**
 * Componente para gestionar la inferencia diferida de audios
 */
export class CsvAudiosComponent {
  recordings: RecordingEmotions[] = [];
  

  /**
   * Método que maneja la subida de archicos.
   * Hace uso del CSVGestor, que transforma los datos subidos en Records
   * @param event 
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const csvGestor = new CsvGestor();
      csvGestor.loadCsv(file).then((data) => {
        this.recordings = data;
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
      const audioUrl = `audio/${recording.fileName}`; 
      try {
        const response = await fetch(audioUrl);
        const audioBlob = await response.blob(); 
        recording.audioBlob = audioBlob; 
        if (recording.transcription) {
          console.log("love" , recording.alignments)
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
      alignments_final.push({end , start, word }); 
    });
    return alignments_final;
  }
  
}
