import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth-services';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Inyecta el servicio de autenticación
  const router = inject(Router); // Inyecta el router para redirigir

  const expectedRole = route.data?.['expectedRole']; // Utiliza la notación de corchetes para acceder a expectedRole
  const currentUser = authService.getCurrentUserValue(); // Utiliza el nuevo método para obtener el usuario actual


  if (authService.isLoggedIn()) {
    // Si la ruta no tiene un rol esperado, permite el acceso
    if (!expectedRole) {
      return true;
    }

    // Si la ruta tiene un rol esperado, verifica que el usuario tenga el rol requerido
    if (currentUser && currentUser.role === expectedRole) {
      return true;
    }

    // Si el rol no coincide, redirige a "access-denied"
    router.navigate(['/access-denied']);
    return false;
  }

  // Si el usuario no está logueado, redirige a "login"
  router.navigate(['/login']);
  return false;
};