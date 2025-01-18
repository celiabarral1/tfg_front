import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth-services';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Inyecta el servicio de autenticación
  const router = inject(Router); // Inyecta el router para redirigir

  if (authService.isLoggedIn()) {
    return true; // Si el usuario está logueado, permite la navegación
  } else {
    router.navigate(['/login']); // Si no está logueado, redirige al login
    return false;
  }
};
