import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutMainComponent } from './@core/common/layout-main/layout-main.component';
import { LayoutHeaderComponent } from './@core/common/layout-header/layout-header.component';
import { LayoutFooterComponent } from './@core/common/layout-footer/layout-footer.component';
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
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AudioRecordedComponent } from './audio/audio-recorded/audio-recorded.component';
import { ColorGenerator } from './@core/common/utils/color-generator';
import { AudioVadComponent } from './audio/audio-vad/audio-vad.component';
import { AudioVadLiveComponent } from './audio/audio-vad-live/audio-vad-live.component';
import { AudioEmotionsComponent } from './audio/audio-vad-live/audio-emotions/audio-emotions.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CsvAudiosComponent } from './audio/csv-audios/csv-audios.component';
import { LayoutNavComponent } from './@core/common/layout-nav/layout-nav.component';
import { CustomCardComponent } from './principal/custom-card/custom-card.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { LoginComponent } from './authentication/login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutMainComponent,
    LayoutHeaderComponent,
    LayoutFooterComponent,
    IndividualComponent,
    IndividualFormComponent,
    DimensionalComponent,
    CategoricComponent,
    AudioComponent,
    PrincipalComponent,
    AudioRecordedComponent,
    AudioVadComponent,
    AudioVadLiveComponent,
    AudioEmotionsComponent,
    CsvAudiosComponent,
    LayoutNavComponent,
    CustomCardComponent,
    AuthenticationComponent,
    LoginComponent
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
    BrowserAnimationsModule
  ],
  providers: [
    provideClientHydration(),
    ColorGenerator
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
