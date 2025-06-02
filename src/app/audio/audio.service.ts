import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiConfigService } from '../@core/common/api/api-config.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private apiUrl: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.apiUrl = this.apiConfig.getApiUrl();  // Usamos el ApiConfigService para obtener la URL base
  }

  /**
   * Petición al endpoint que envía un audio y recibe su análisis emocional.
   */
  getDataAudio(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/audio/getData`, formData);
  }

  sendAudios(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/getAudios`, formData);
  }

  /**
   * Devuelve los modelos de inferencia disponibles.
   */
  getAvalaibleModels() : Observable<any> {
    return this.http.get(`${this.apiUrl}/audio/getAvalaibleModels`);
  }

  /**
   * Devuelve el intervalo de silencio establecido.
   */
  getInferenceInterval() : Observable<any> {
     return this.http.get(`${this.apiUrl}/audio/getInferenceInterval`);
  }
}
