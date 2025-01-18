import Papa from "papaparse";
import { RecordingEmotions } from "../../../audio/audio-vad-live/model/recording-emotions";


export class CsvGestor {
  static generateCsv(recordingsWithEmotions: RecordingEmotions[]): string {
    const headers = [
      'file_name', 'Emotion_1_label', 'Emotion_1_mean', 'Emotion_1_std', 
      'Emotion_2_label', 'Emotion_2_mean', 'Emotion_2_std', 
      'Emotion_3_label', 'Emotion_3_mean', 'Emotion_3_std', 
      'valence', 'arousal', 'dominance', 'user_id', 'timestamp', 'audioblob', 'transcription'
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
      recording.transcription
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
        const csvData = reader.result as string;
        const parsedData = this.parseCsv(csvData);
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
      complete: (result: { data: any[]; }) => {
        result.data.forEach((row: any) => {
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
            transcription : row.transcription
          });
          
          records.push(recordingEmotion);
        });
      },
    });

    return records;
  }
}
