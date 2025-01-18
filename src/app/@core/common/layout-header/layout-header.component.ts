import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../authentication/auth-services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout-header',
  templateUrl: './layout-header.component.html',
  styleUrl: './layout-header.component.scss'
})
export class LayoutHeaderComponent implements OnInit {
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }
}
