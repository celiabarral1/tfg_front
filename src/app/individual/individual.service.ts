import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiConfigService } from "../@core/common/api/api-config.service";
import { read } from "fs";

@Injectable({
    providedIn: 'root'  // Esto asegura que Angular registre el servicio en el root module
  })

  export class IndividualService {
    private apiUrl: string;

    constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
      this.apiUrl = this.apiConfig.getApiUrl() ;  // Usamos el ApiConfigService para obtener la URL base
    }

    /**
     * Petición que devuelve las ventanas temporales para el análisis.
     */
    getTimePeriods(): Observable<any> {
      return this.http.get(`${this.apiUrl}/getTimePeriods`); 
    }

    /**
     * Petición que devuelve las ids disponibles para el análisis.
     */
    getIds(): Observable<any> {
      return this.http.get(`${this.apiUrl}/ids`); 
    }

    /**
     * Petición que devuelve los turnos para el análisis.
     */
    getShifts(): Observable<any> {
      return this.http.get(`${this.apiUrl}/getShifts`); 
    }
  
    getEmotions(): Observable<any> {
      return this.http.get(`${this.apiUrl}/getEmotions`); 
    }

    /**
     * Petición que tiene como parámetro los datos del formulario:
     * ID, fechas, tipo de emociones.
     * Devuelve los datos emocionales asociados a los datos individuales anteriores.
     */
    filterRecords(requestData: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/records/id`, requestData);
    }

    /**
     * Petición que tiene como parámetro los datos del formulario:
     * Turno, fechas, tipo de emociones.
     * Devuelve los datos emocionales asociados a los datos de turno anteriores.
     */
    filterByShifts(requestData: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/records/shift`, requestData);
  }

    
  }