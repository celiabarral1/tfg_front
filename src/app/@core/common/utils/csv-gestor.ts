import Papa from "papaparse";
import { RecordingEmotions } from "../../../audio/audio-vad-live/model/recording-emotions";
import { Alignment } from "../../../audio/audio-vad-live/model/alignment";

/**
 * Clase de utlidad que gestiona el tratamiento de generación y carga de los archivos .csv con los que interacciona la aplicación.
 * Define las estructuras de tanto para generar un .csv como para manipular los datos que aporta uno.
 */
export class CsvGestor {
  // static generateCsv(recordingsWithEmotions: RecordingEmotions[]): string {
  //   const headers = [
  //     'file_name', 'Emotion_1_label', 'Emotion_1_mean', 'Emotion_1_std', 
  //     'Emotion_2_label', 'Emotion_2_mean', 'Emotion_2_std', 
  //     'Emotion_3_label', 'Emotion_3_mean', 'Emotion_3_std', 
  //     'valence', 'arousal', 'dominance', 'user_id', 'timestamp', 'audioblob', 'transcription', 'alignments'
  //   ];

  //   const rows = recordingsWithEmotions.map(recording => [
  //     recording.fileName,
  //     recording.Emotion_1_label,
  //     recording.Emotion_1_mean,
  //     recording.Emotion_1_std,
  //     recording.Emotion_2_label,
  //     recording.Emotion_2_mean,
  //     recording.Emotion_2_std,
  //     recording.Emotion_3_label,
  //     recording.Emotion_3_mean,
  //     recording.Emotion_3_std,
  //     recording.valence,
  //     recording.arousal,
  //     recording.dominance,
  //     recording.userId,
  //     recording.timestamp,
  //     recording.audioBlob,
  //     recording.transcription,
  //     `"${JSON.stringify(recording.alignments).replace(/"/g, '""')}"` // Convertir alignments a JSON para guardarlo en el CSV
  //   ]);

  //   // Combine headers and rows into CSV content
  //   const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  //   return csvContent;
  // }

  /**
   * Método estático para generar un .csv con la estructura requerida para tratar los datos en el proyecto.
   * Consta de las siguientes cabeceras : 'file_name', 'Emotion_1_label', 'Emotion_1_mean', 'Emotion_1_std', 'Emotion_2_label', 'Emotion_2_mean', 'Emotion_2_std', 
   *'Emotion_3_label', 'Emotion_3_mean', 'Emotion_3_std', 'valence', 'arousal', 'dominance', 'user_id', 'timestamp', 'audioblob', 'transcription', 'alignments'.
   * Representan el nombre del fichero, 3 emociones categóricos con sus respectivas etiquetas, medias y desviaciones, los valores de las emociones
   * dimensionales, el identificador del usuario, la marca temporal del audio, su transcripción y la alineación de la misma.
   * Traslada los valores que recibe al formato adecuado para almacenarlos en el archivo.
   * @param audios conjunto de archivos, audios, acompñados de su análisis emocional
   * @returns el conjunto de cabecera y datos unidos por ',' , de manera común para un .csv
   */
  static generateCsv(audios: any[]): string {
    const headers = [
      'file_name', 'Emotion_1_label', 'Emotion_1_mean', 'Emotion_1_std', 
      'Emotion_2_label', 'Emotion_2_mean', 'Emotion_2_std', 
      'Emotion_3_label', 'Emotion_3_mean', 'Emotion_3_std', 
      'valence', 'arousal', 'dominance', 'user_id', 'timestamp', 
      'audioblob', 'transcription', 'alignments'
    ];

    const rows = audios.map(audio => [
      audio.fileName,
      audio.Emotion_1_label,
      audio.Emotion_1_mean,
      audio.Emotion_1_std,
      audio.Emotion_2_label,
      audio.Emotion_2_mean,
      audio.Emotion_2_std,
      audio.Emotion_3_label,
      audio.Emotion_3_mean,
      audio.Emotion_3_std,
      audio.valence,
      audio.arousal,
      audio.dominance,
      audio.userId,
      audio.timestamp,
      audio.audioBlob,
      `"${JSON.stringify(audio.transcription || '').replace(/"/g, '""')}"`, 
      `"${JSON.stringify(audio.alignments || '').replace(/"/g, '""')}"`
    ]);


    // Generar contenido CSV
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csvContent;
  }

  /**
   * Método que procede a descargar el csv que se genera en generateCsv
   * @param audiosWithEmotions los datos de los audios junto a su análisis emocional para plasmar en el .csv
   */
  static downloadCsv(audiosWithEmotions: any[], fileName:string): void {
    const csvContent = this.generateCsv(audiosWithEmotions);

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = fileName + '.csv';
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Método que abarca desde la apertura del archivo .csv hasta la conversión de los datos al modelo 
   * de la aplicación.
   * Utiliza FileReader para leerlo, convierte el contenido en una cadena de texto y lo transforma
   * en una lista de RecordingEmotions
   * @param file el fichero a leer.
   * @returns 
   */
  public loadCsv(file: File): Promise<RecordingEmotions[]> {
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

 

  /** 
   * Método para transformar los datos aportados por un .csv en el modelo con el que trabaja la app.
   * Utiliza PapaParse para procesar el contenido y trasladarlo en una lista de RecordingEmotions.
   * @param csvData Recibe el contenido del .csv como una cadena de texto.
   * @returns los datos leídos del archivo modelados en una lista de objetos de RecordingEmotions.
   * @throws {Error} por fallos de formato en los campos.
  */
  private parseCsv(csvData: string): RecordingEmotions[] {
    const records: RecordingEmotions[] = [];
  
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      quoteChar: '"',
      complete: (result: { data: any[]; }) => {
        result.data.forEach((row: any) => {
          
          let alignments: Alignment[] = [];
          if (row.alignments) {
            try {
              console.log('Raw alignments:', row.alignments); 
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
            audioBlob: new Blob(),
            transcription: row.transcription,
            alignments: Array.isArray(alignments) ? alignments : []
          });
          records.push(recordingEmotion);
        });
      },
    });
  
    return records;
  }
  
}
