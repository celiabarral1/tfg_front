import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutMainComponent } from './@core/common/layout-main/layout-main.component';
import { LayoutHeaderComponent } from './@core/common/layout-header/layout-header.component';
import { IndividualComponent } from './individual/individual.component';
import { IndividualFormComponent } from './individual/individual-form/individual-form.component';
import { SharedModule } from './shared/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DimensionalComponent } from './charts/dimensional/dimensional.component';
import { CategoricComponent } from './charts/categoric/categoric.component';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import { AudioComponent } from './audio/audio.component';
import { PrincipalComponent } from './principal/principal.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AudioVadLiveComponent } from './audio/audio-vad-live/audio-vad-live.component';
import { AudioEmotionsComponent } from './audio/audio-vad-live/audio-emotions/audio-emotions.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CsvAudiosComponent } from './audio/csv-audios/csv-audios.component';
import { CustomCardComponent } from './principal/custom-card/custom-card.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { LoginComponent } from './authentication/login/login.component';
import { RegisterFormComponent } from './workers/register-form/register-form.component';
import { ShiftRepresentationComponent } from './shift-representation/shift-representation.component';
import { ShiftFormComponent } from './shift-representation/shift-form/shift-form.component';
import { GraphicRepresentationComponent } from './charts/graphic-representation/graphic-representation.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerToggle } from '@angular/material/datepicker';
import { AccessDeniedComponent } from './authentication/access-denied/access-denied.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { ConfigComponent } from './config/config.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { DeferredInferenceComponent } from './audio/deferred-inference/deferred-inference.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutMainComponent,
    LayoutHeaderComponent,
    IndividualComponent,
    IndividualFormComponent,
    DimensionalComponent,
    CategoricComponent,
    AudioComponent,
    PrincipalComponent,
    AudioVadLiveComponent,
    AudioEmotionsComponent,
    CsvAudiosComponent,
    CustomCardComponent,
    AuthenticationComponent,
    LoginComponent,
    RegisterFormComponent,
    ShiftRepresentationComponent,
    ShiftFormComponent,
    GraphicRepresentationComponent,
    AccessDeniedComponent,
    AnalysisComponent,
    ConfigComponent,
    DeferredInferenceComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule, 
    FormsModule, 
    ReactiveFormsModule,
    NgSelectModule,
    HttpClientModule,
    NgxEchartsModule.forRoot({ echarts }),
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    MatExpansionModule,
    BrowserAnimationsModule
  ],
  providers: [
    provideClientHydration(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
