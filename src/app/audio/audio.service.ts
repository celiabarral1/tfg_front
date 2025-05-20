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

  getDataAudio(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/audio/getData`, formData);
  }

  sendAudios(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/getAudios`, formData);
  }

  getAvalaibleModels() : Observable<any> {
    return this.http.get(`${this.apiUrl}/audio/getAvalaibleModels`);
  }
}
