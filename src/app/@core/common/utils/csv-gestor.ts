import Papa from "papaparse";
import { RecordingEmotions } from "../../../audio/audio-vad-live/model/recording-emotions";
import { Alignment } from "../../../audio/audio-vad-live/model/alignment";


export class CsvGestor {
  static generateCsv(recordingsWithEmotions: RecordingEmotions[]): string {
    const headers = [
      'file_name', 'Emotion_1_label', 'Emotion_1_mean', 'Emotion_1_std', 
      'Emotion_2_label', 'Emotion_2_mean', 'Emotion_2_std', 
      'Emotion_3_label', 'Emotion_3_mean', 'Emotion_3_std', 
      'valence', 'arousal', 'dominance', 'user_id', 'timestamp', 'audioblob', 'transcription', 'alignments'
    ];

    const rows = recordingsWithEmotions.map(recording => [
      recording.fileName,
      recording.Emotion_1_label,
      recording.Emotion_1_mean,
      recording.Emotion_1_std,
      recording.Emotion_2_label,
      recording.Emotion_2_mean,
      recording.Emotion_2_std,
      recording.Emotion_3_label,
      recording.Emotion_3_mean,
      recording.Emotion_3_std,
      recording.valence,
      recording.arousal,
      recording.dominance,
      recording.userId,
      recording.timestamp,
      recording.audioBlob,
      recording.transcription,
      `"${JSON.stringify(recording.alignments).replace(/"/g, '""')}"` // Convertir alignments a JSON para guardarlo en el CSV
    ]);

    // Combine headers and rows into CSV content
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csvContent;
  }

  static downloadCsv(recordingsWithEmotions: RecordingEmotions[]): void {
    const csvContent = this.generateCsv(recordingsWithEmotions);

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = 'recordings_with_emotions.csv';
    link.click();

    URL.revokeObjectURL(url);
  }

  public loadCsvFile(file: File): Promise<RecordingEmotions[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        console.log(reader.result)
        const csvData = reader.result as string;
        console.log(csvData)
        const parsedData = this.parseCsv(csvData);
        console.log("QUE DEVUELVE", parsedData)
        resolve(parsedData);
      };
      
      reader.onerror = (error) => reject(error);
      
      reader.readAsText(file);
    });
  }

  // Método para parsear los datos del CSV
  private parseCsv(csvData: string): RecordingEmotions[] {
    const records: RecordingEmotions[] = [];
  
    // Usamos PapaParse para convertir el CSV en un array de objetos
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      quoteChar: '"',
      complete: (result: { data: any[]; }) => {
        result.data.forEach((row: any) => {
          
          let alignments: Alignment[] = [];
          if (row.alignments) {
            try {
              // Verificar si el campo alignments es una cadena JSON válida
              console.log('Raw alignments:', row.alignments); // Ver el valor crudo de alignments
              const parsedAlignments = JSON.parse(row.alignments);
              
              if (Array.isArray(parsedAlignments)) {
                // Verificar si parsedAlignments es un array válido
                console.log('Parsed alignments:', parsedAlignments);
                alignments = parsedAlignments.map((item: any) => ({
                  word: item.word || '', // Valor por defecto si falta
                  start: parseFloat(item.start) || 0, // Asegúrate de convertir a número
                  end: parseFloat(item.end) || 0, // Asegúrate de convertir a número
                }));
              } else {
                console.error('El campo alignments no es un array:', parsedAlignments);
              }
            } catch (error) {
              console.error('Error al parsear alignments:', error, row.alignments);
            }
          }
  
          console.log('Tipo de alignments:', typeof alignments); // Verifica si alignments es un array
          console.log('Alignments después de parsear:', alignments); // Verifica el resultado final
  
          const recordingEmotion = new RecordingEmotions({
            fileName: row.file_name,
            Emotion_1_label: row.Emotion_1_label,
            Emotion_1_mean: parseFloat(row.Emotion_1_mean),
            Emotion_1_std: parseFloat(row.Emotion_1_std),
            Emotion_2_label: row.Emotion_2_label,
            Emotion_2_mean: parseFloat(row.Emotion_2_mean),
            Emotion_2_std: parseFloat(row.Emotion_2_std),
            Emotion_3_label: row.Emotion_3_label,
            Emotion_3_mean: parseFloat(row.Emotion_3_mean),
            Emotion_3_std: parseFloat(row.Emotion_3_std),
            valence: parseFloat(row.valence),
            arousal: parseFloat(row.arousal),
            dominance: parseFloat(row.dominance),
            userId: row.user_id || '',
            timestamp: parseInt(row.timestamp, 10),
            audioBlob: undefined, // No se tiene el audio en el CSV, se puede cargar después
            transcription: row.transcription,
            alignments: Array.isArray(alignments) ? alignments : [] // Asegúrate de que alignments sea un array
          });
  
          console.log("PFFFF", recordingEmotion);
          records.push(recordingEmotion);
        });
      },
    });
  
    return records;
  }
  
}
