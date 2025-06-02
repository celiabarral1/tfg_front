import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../@core/common/api/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class ShiftService {

  private apiUrl: string;
  
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.apiUrl = this.apiConfig.getApiUrl();  // Usamos el ApiConfigService para obtener la URL base
  }
  
  /**
   * Endpoint que devuelve los turnos establecidos para análisis.
   * @returns 
   */
  getShifts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getShifts`); 
  }
}
