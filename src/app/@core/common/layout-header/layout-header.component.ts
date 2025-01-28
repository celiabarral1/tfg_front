import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../authentication/auth-services';
import { NavigationEnd, Router } from '@angular/router';

/**
 * Componente que representa y gestiona el encabezado de la app.
 */
@Component({
  selector: 'app-layout-header',
  templateUrl: './layout-header.component.html',
  styleUrl: './layout-header.component.scss'
})

export class LayoutHeaderComponent implements OnInit {
  /**
   * Propieda pública que identifica si hay un usuario loggeado o no.
   */
  isLoggedIn: boolean = false;
  /**
   * Propieda pública que indica si el usuario está en la página de iniciar sesión.
   * Se utiliza para mostrar un menú de navegación u otro.
   */
  isLoginPage: boolean = false;

  /**
   * Constructor.
   * @param authService servicio que gestiona el estado de sesión del usuario.
   * @param router servicio de enrutamiento que proporciona navegación.
   */
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Inicialización del componente.
   * Las rutas de navegación se suscriben a un evento para detectar si el usuario se encuentra en la página de inicio de sesión
   * o actualizar si está loggeado o no, para realizar las acciones e¡pertinentes.
   */
  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage = this.router.url === '/login';
        this.isLoggedIn = this.authService.isLoggedIn();
      }
    });
  }

  /**
   * Saca de sesión al usuario.
   */
  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }
}
