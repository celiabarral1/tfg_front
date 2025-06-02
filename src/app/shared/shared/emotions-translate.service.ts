import { Injectable } from '@angular/core';

/**
 * EmotionTranslationService
 * Servicio de traducciones para las emociones 
 */
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
    'arousal': 'excitación',
    'valence':  'intensidad',
    'dominance': 'dominancia'
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
