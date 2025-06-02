import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Componente principal de la aplicación.
 * Agrupa todas las vistas. 
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontendWebEmotions';
  
  isLoginPage: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.isLoginPage = this.router.url.includes('/login');
    });
  }
}
