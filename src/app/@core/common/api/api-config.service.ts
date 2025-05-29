import { Injectable } from '@angular/core';

/**
 * Configuración general capa de servicios, de la API.
 * Determina la URL base para realizar solicitudes a la API.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  /**
   * Define la URL base de la API.
   * @private
   */
  private apiUrl: string = 'http://127.0.0.1:5000';

    /**
   * Define la URL base de la API.
   * @private
   */
  private apiUrlForceAlignment: string = 'http://127.0.0.1:5001';

  /**
   * Constructor de ApiConfigService.
   */
  constructor() { }

  /**
   * Devuelve la URL base de la API.
   * @returns {string} URL base de la API.
   */
  getApiUrl(): string {
    return this.apiUrl;
  }

    /**
   * Devuelve la URL base de la API.
   * @returns {string} URL base de la API.
   */
  getApiUrlForceAlignment(): string {
    return this.apiUrlForceAlignment;
  }
}
