import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiConfigService } from '../@core/common/api/api-config.service';
import { Observable } from 'rxjs';

/**
 * Servicio para gestionar las peticiones relacionadas con la categorización de 
 * de trabajadores por trastorno psicológico.
 */
@Injectable({
  providedIn: 'root'
})
export class AnalysisService {

   private apiUrl: string;
  
   /**
    * Consturctor del servicio.
    * Obtiene la dirección base de la API e inicializa el protocolo HTTP por el cual se realizarán 
    * las peticiones.
    * @param http servicio HTTP para realizar solicitudes a la API.
    * @param apiConfig servicio interno para gestionar la dirección base de la API.
    */
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.apiUrl = this.apiConfig.getApiUrl() ; 
  }

  /**
   * Método para realizar una petición GET a la API 
   * @returns un observable que representa los datos obtenidos de la petición a la API
   */
  getClassification(): Observable<any> {
    return this.http.get(`${this.apiUrl}/classify`); 
  }
}
