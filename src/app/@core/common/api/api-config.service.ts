import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private apiUrl: string = 'http://127.0.0.1:5000';  

  constructor() { }

  getApiUrl(): string {
    return this.apiUrl;
  }

}

