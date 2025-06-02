import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiConfigService } from '../@core/common/api/api-config.service';
import { Employee } from './model/employee';
import { Observable } from 'rxjs';

/**
 * EmployeeService 
 */
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.apiUrl = this.apiConfig.getApiUrl();  
  }

  /**
   * Endpoint para insertar un trabajador.
   */
  insertEmployee(employeeToInsert: Employee): Observable<any> { 
    return this.http.post(`${this.apiUrl}/workers/register`, employeeToInsert);
  }

  getRols(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getRols`); 
  }

  getWorkersId(): Observable<any> {
      return this.http.get(`${this.apiUrl}//workers/getIds`); 
  }

  
}
