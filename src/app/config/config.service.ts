import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiConfigService } from '../@core/common/api/api-config.service';
import { map, Observable } from 'rxjs';
import { Config } from './model/config';
import { FullConfig } from './model/fullConfig';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.apiUrl = this.apiConfig.getApiUrl();  // Usamos el ApiConfigService para obtener la URL base
  }

  getConfig(): Observable<Config> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(data => {
        return new Config({
          nWorkers: data.GENERATION.n_trabajadores,
          nSamples: data.GENERATION.n_samples,
          inferenceModel: data.INFERENCE.inference_model,
          silenceInterval: 1000  // Valor por defecto si no viene en el backend
        });
      })
    );
  }

getFullConfig(): Observable<FullConfig> {
    return this.http.get<any>(`${this.apiUrl}/getConfig`).pipe(
      map(data => {
        return {
          debug: data.DEBUG,
          jwtSecretKey: data.JWT_SECRET_KEY,
          secretKey: data.SECRET_KEY,
          corsOrigins: data.CORS_ORIGINS,
          uploadFolder: data.UPLOAD_FOLDER,
          maxContentLength: data.MAX_CONTENT_LENGTH,
          port: data.PORT,
          alignmentPort: data.PORT_FORCE_ALIGNMENT,
          shifts: data.SHIFTS,
          generation: {
            nWorkers: data.GENERATION?.n_trabajadores,
            nSamples: data.GENERATION?.n_samples
          },
          inference: {
            silenceInterval: data.INFERENCE?.silence_interval,
            inferenceModel: data.INFERENCE?.inference_model
          }
        } as FullConfig;
      })
    );
  }
  
  changeConfig(config: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/changeConfig`, config); 
  }
  
  resetConfig(): Observable<any> {
    return this.http.get(`${this.apiUrl}/resetConfig`); 
  }

  changeFileWithData(fileName: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/setCsv`, { file: fileName });
}

}
