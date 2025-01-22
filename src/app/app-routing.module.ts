import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndividualComponent } from './individual/individual.component';
import { PrincipalComponent } from './principal/principal.component';
import { AudioComponent } from './audio/audio.component';
import { CsvAudiosComponent } from './audio/csv-audios/csv-audios.component';
import { LoginComponent } from './authentication/login/login.component';
import { authGuard } from './authentication/auth.guard';
import { RegisterFormComponent } from './workers/register-form/register-form.component';
import { ShiftRepresentationComponent } from './shift-representation/shift-representation.component';

const routes: Routes = [
  { path: '', component: PrincipalComponent }, 
  { path: 'individual', component: IndividualComponent, canActivate: [authGuard] } ,
  { path: 'audio', component: AudioComponent, canActivate: [authGuard] } ,
  { path: 'csv', component: CsvAudiosComponent, canActivate: [authGuard] } ,
  { path: 'login', component: LoginComponent } , 
  { path: 'register', component: RegisterFormComponent, canActivate: [authGuard] },
  { path: 'shift', component: ShiftRepresentationComponent, canActivate: [authGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
