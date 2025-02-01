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

    getTimePeriods(): Observable<any> {
      return this.http.get(`${this.apiUrl}/getTimePeriods`); 
    }

    getIds(): Observable<any> {
      return this.http.get(`${this.apiUrl}/ids`); 
    }

    getShifts(): Observable<any> {
      return this.http.get(`${this.apiUrl}/getShifts`); 
    }
  
    getEmotions(): Observable<any> {
      return this.http.get(`${this.apiUrl}/getEmotions`); 
    }

    filterRecords(requestData: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/records/id`, requestData);
    }

    filterByShifts(requestData: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/records/shift`, requestData);
  }

    
  }