import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiConfigService } from '../../@core/common/api/api-config.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ForceAlignmentService {
  private apiUrl: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.apiUrl = this.apiConfig.getApiUrlForceAlignment();  // Usamos el ApiConfigService para obtener la URL base
  }

  /**
   * Petición al endpoint que pasándole un audio devuelve su alineamiento.
   */
  getForcedAlignment(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/getForcedAlignment`, formData);
  }

}