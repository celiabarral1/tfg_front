import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth-services';

/**
 * Guardia que controla mediante una función, para la ruta que recibe si hay un usuario loggeado o no
 *  y si tiene el rol necesario.
 * @param route 
 * @param state 
 * @returns true si está loggeado y false si no
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); 
  const router = inject(Router); 

  /**
   * Obtiene el rol del usuario que está en sesión, para comprobar si tieen permisos para acceder.
   */
  const expectedRole = route.data?.['expectedRole']; 
  const currentUser = authService.getCurrentUserValue();


  if (authService.isLoggedIn()) {
    if (!expectedRole) {
      return true;
    }
    if (currentUser && currentUser.role === expectedRole) {
      return true;
    }
    router.navigate(['/access-denied']);
    return false;
  }

  router.navigate(['/login']);
  return false;
};