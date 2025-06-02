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
import { GraphicRepresentationComponent } from './charts/graphic-representation/graphic-representation.component';
import { AccessDeniedComponent } from './authentication/access-denied/access-denied.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { ConfigComponent } from './config/config.component';
import { DeferredInferenceComponent } from './audio/deferred-inference/deferred-inference.component';

// const routes: Routes = [
//   { path: '', component: PrincipalComponent }, 
//   { path: 'individual', component: IndividualComponent, canActivate: [authGuard] ,
//     data: { expectedRoles: ['psychologist', 'admin'] } } ,
//   { path: 'representation', component: GraphicRepresentationComponent, canActivate: [authGuard],
//     data: { expectedRoles: ['psychologist', 'admin'] } } ,
//     { path: 'representation/:id', component: GraphicRepresentationComponent, canActivate: [authGuard],
//       data: { expectedRoles: ['psychologist', 'admin'] }  } ,
//   { path: 'audio', component: AudioComponent, canActivate: [authGuard] } ,
//   { path: 'analysis', component: AnalysisComponent, canActivate: [authGuard],
//     data: { expectedRoles: ['psychologist', 'admin'] } } ,
//    { path: 'csv', component: DeferredInferenceComponent, canActivate: [authGuard] ,
//     data: { expectedRoles: ['psychologist', 'admin'] } } ,
//   { path: 'login', component: LoginComponent } , 
//   { path: 'register', component: RegisterFormComponent, canActivate: [authGuard] },
//   { path: 'config', component: ConfigComponent, canActivate: [authGuard] },
//   { path: 'shift', component: ShiftRepresentationComponent, canActivate: [authGuard] ,
//     data: { expectedRoles: ['psychologist', 'admin'] } } ,
//   { path: 'access-denied', component: AccessDeniedComponent }
// ];
const routes: Routes = [
  { path: '', component: PrincipalComponent },
  { path: 'individual', component: IndividualComponent },
  { path: 'representation', component: GraphicRepresentationComponent },
  { path: 'representation/:id', component: GraphicRepresentationComponent },
  { path: 'audio', component: AudioComponent },
  { path: 'analysis', component: AnalysisComponent },
  { path: 'csv', component: DeferredInferenceComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterFormComponent },
  { path: 'config', component: ConfigComponent },
  { path: 'shift', component: ShiftRepresentationComponent },
  { path: 'access-denied', component: AccessDeniedComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
