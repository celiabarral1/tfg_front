import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiConfigService } from '../@core/common/api/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string; // URL de tu backend
  private currentUserSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.apiUrl = this.apiConfig.getApiUrl();
    // Verificar si estamos en el cliente antes de acceder a localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        this.currentUserSubject.next(this.getUsernameFromToken(token));
      }
    }
  }

  login(username: string, password: string) {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        map(response => {
          // Verificar si estamos en el cliente antes de acceder a localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', response.access_token);
          }
          this.currentUserSubject.next(this.getUsernameFromToken(response.access_token));
          return response;
        })
      );
  }

  logout() {
    // Verificar si estamos en el cliente antes de acceder a localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
    this.currentUserSubject.next(null);
  }

  isLoggedIn() {
    // Verificar si estamos en el cliente antes de acceder a localStorage
    return typeof window !== 'undefined' && !!localStorage.getItem('access_token');
  }

  getUsernameFromToken(token: string): string {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  }

  get currentUser() {
    return this.currentUserSubject.asObservable();
  }
}
