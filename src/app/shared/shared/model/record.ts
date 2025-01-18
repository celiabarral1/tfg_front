export class Record {
    Emotion_1_label: string;
    Emotion_1_mean: number;
    Emotion_1_std: number;
    Emotion_2_label: string;
    Emotion_2_mean: number;
    Emotion_2_std: number;
    Emotion_3_label: string;
    Emotion_3_mean: number;
    Emotion_3_std: number;
    arousal: number;
    dominance: number;
    file_name: string;
    timestamp: number;
    user_id: number;
    valence: number;
  
    constructor(data: any) {
      const parseDecimal = (value: string): number => {
        const isNegative = value.startsWith('-');
        const cleanedValue = value.replace(',', '.');
        return isNegative ? -parseFloat(cleanedValue.slice(1)) : parseFloat(cleanedValue);
      };
  
      this.Emotion_1_label = data.Emotion_1_label;
      this.Emotion_1_mean = parseDecimal(data.Emotion_1_mean);
      this.Emotion_1_std = parseDecimal(data.Emotion_1_std);
      this.Emotion_2_label = data.Emotion_2_label;
      this.Emotion_2_mean = parseDecimal(data.Emotion_2_mean);
      this.Emotion_2_std = parseDecimal(data.Emotion_2_std);
      this.Emotion_3_label = data.Emotion_3_label;
      this.Emotion_3_mean = parseDecimal(data.Emotion_3_mean);
      this.Emotion_3_std = parseDecimal(data.Emotion_3_std);
      this.arousal = parseDecimal(data.arousal);
      this.dominance = parseDecimal(data.dominance);
      this.file_name = data.file_name;
      this.timestamp = data.timestamp;
      this.user_id = data.user_id;
      this.valence = parseDecimal(data.valence);
    }
  }
  