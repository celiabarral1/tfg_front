export class RecordingEmotions {
    fileName: string;
    Emotion_1_label: string;
    Emotion_1_mean: number;
    Emotion_1_std: number;
    Emotion_2_label: string;
    Emotion_2_mean: number;
    Emotion_2_std: number;
    Emotion_3_label: string;
    Emotion_3_mean: number;
    Emotion_3_std: number;
    valence: number;
    arousal: number;
    dominance: number;
    userId: number;
    timestamp: number;
    // audioBlob?: string;  // Nueva propiedad para almacenar la grabación
    audioBlob?: Blob;
    transcription: string;
  
    constructor(data: {
      fileName: string;
      Emotion_1_label: string;
      Emotion_1_mean: number;
      Emotion_1_std: number;
      Emotion_2_label: string;
      Emotion_2_mean: number;
      Emotion_2_std: number;
      Emotion_3_label: string;
      Emotion_3_mean: number;
      Emotion_3_std: number;
      valence: number;
      arousal: number;
      dominance: number;
      userId: number;
      timestamp: number;
      // audioBlob?: string;  // Nueva propiedad opcional
      audioBlob?: Blob,
      transcription: string 
    }) {
      this.fileName = data.fileName;
      this.Emotion_1_label = data.Emotion_1_label;
      this.Emotion_1_mean = data.Emotion_1_mean;
      this.Emotion_1_std = data.Emotion_1_std;
      this.Emotion_2_label = data.Emotion_2_label;
      this.Emotion_2_mean = data.Emotion_2_mean;
      this.Emotion_2_std = data.Emotion_2_std;
      this.Emotion_3_label = data.Emotion_3_label;
      this.Emotion_3_mean = data.Emotion_3_mean;
      this.Emotion_3_std = data.Emotion_3_std;
      this.valence = data.valence;
      this.arousal = data.arousal;
      this.dominance = data.dominance;
      this.userId = data.userId;
      this.timestamp = data.timestamp;
      this.audioBlob = data.audioBlob;
      this.transcription = data.transcription;
    }
  
    static toCSVHeader(): string {
      return [
        'file_name',
        'Emotion_1_label',
        'Emotion_1_mean',
        'Emotion_1_std',
        'Emotion_2_label',
        'Emotion_2_mean',
        'Emotion_2_std',
        'Emotion_3_label',
        'Emotion_3_mean',
        'Emotion_3_std',
        'valence',
        'arousal',
        'dominance',
        'user_id',
        'timestamp',
        'transcription'
      ].join(',');
    }
  
    toCSVRow(): string {
      return [
        this.fileName,
        this.Emotion_1_label,
        this.Emotion_1_mean,
        this.Emotion_1_std,
        this.Emotion_2_label,
        this.Emotion_2_mean,
        this.Emotion_2_std,
        this.Emotion_3_label,
        this.Emotion_3_mean,
        this.Emotion_3_std,
        this.valence,
        this.arousal,
        this.dominance,
        this.userId,
        this.timestamp,
        this.transcription
      ].join(',');
    }
  }
  