import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EmotionTranslationService {
  private emotionsTranslations: { [key: string]: string } = {
    'happiness': 'alegría',
    'anger': 'ira',
    'disgust': 'asco',
    'fear': 'miedo',
    'sadness': 'tristeza',
    'neutral': 'neutral',
    'Arousal': 'excitación',
    'Valence':  'intensidad',
    'Dominance': 'dominancia'
  };

  constructor() {}

  /**
   * Traduce una emoción al español.
   * @param emotion El nombre de la emoción en inglés.
   * @returns La traducción en español.
   */
  translateEmotion(emotion: string): string {
    return this.emotionsTranslations[emotion.toLowerCase()] || emotion;
  }
}
