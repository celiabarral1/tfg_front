import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth-services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

/**
 * Componente de Iniciar Sesión en la aplicación
 * Utiliza el servicio de autenticación para comprobar la entrada al sistema 
 */
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  /**
   * Si los datos son correctos (verificado por authService)
   * se lleva al usuario a la página principal
   */
  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => {
          this.errorMessage = 'Usuario o contraseña incorrectos.';
          this.loginForm.reset();
          console.error(err);
        }
      });
    }
  }
}
