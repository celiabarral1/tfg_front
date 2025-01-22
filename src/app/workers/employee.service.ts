import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiConfigService } from '../@core/common/api/api-config.service';
import { Employee } from './model/employee';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.apiUrl = this.apiConfig.getApiUrl();  
  }

  insertEmployee(employeeToInsert: Employee): Observable<any> { 
    return this.http.post(`${this.apiUrl}/workers/register`, employeeToInsert);
  }
}
