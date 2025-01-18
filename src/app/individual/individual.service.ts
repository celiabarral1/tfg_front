import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiConfigService } from "../@core/common/api/api-config.service";

@Injectable({
    providedIn: 'root'  // Esto asegura que Angular registre el servicio en el root module
  })

  export class IndividualService {
    private apiUrl: string;

    constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
      this.apiUrl = this.apiConfig.getApiUrl();  // Usamos el ApiConfigService para obtener la URL base
    }

    getTimePeriods(): Observable<any> {
      return this.http.get(`${this.apiUrl}/getTimePeriods`); 
    }

    getEmotions(): Observable<any> {
      return this.http.get(`${this.apiUrl}/getEmotions`); 
    }

    filterRecords(userId: number, timeOption: string): Observable<any> {
      const payload = {
        user_id: userId,
        time_option: timeOption
      };

      return this.http.post(`${this.apiUrl}/filter-records`, payload);
  }

    
  }