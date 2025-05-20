import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiConfigService } from '../@core/common/api/api-config.service';

interface User {
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})

/**
 * Servicio encargado de gestionar la vida de una sesión
 * 
 */
export class AuthService {
  private apiUrl: string; 
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  /**
   * Comprueba si existe un token asociado al usaurio, es decir si hay alguien en sesión
   * @param http protocolo 
   * @param apiConfig proporciona la url base de la aplicación
   */
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.apiUrl = this.apiConfig.getApiUrl()
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        this.currentUserSubject.next(this.getUserFromToken(token));
      }
    }
  }

  /**
   * Realiza la petición de inicar sesión para un usuario y una contraseña.
   * Si todo es correcto, recibe un token, con el que gestiona la sesión.
   * @param username usuario que quiere iniciar sesión
   * @param password contraseña para intentar iniciar sesión
   * @returns 
   */
  login(username: string, password: string) {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        map(response => {
          // Verificar si estamos en el cliente antes de acceder a localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', response.access_token);
          }
          this.currentUserSubject.next(this.getUserFromToken(response.access_token));
          return response;
        })
      );
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
    this.currentUserSubject.next(null);
  }

  isLoggedIn() {
    return typeof window !== 'undefined' && !!localStorage.getItem('access_token');
  }

  getUserFromToken(token: string): User {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      console.log(payload.sub.username,payload.sub.role )
      return { username: payload.sub.username, role: payload.sub.role };
    } catch (e) {
      console.error('Error decoding token:', e);
      return { username: '', role: '' };
    }
  }

  get currentUser() {
    return this.currentUserSubject.asObservable();
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthorized(...roles: string[]): boolean {
    const currentUser = this.getCurrentUserValue();
    return currentUser ? roles.includes(currentUser.role) : false;
  }
}