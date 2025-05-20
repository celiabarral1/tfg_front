import { Component, OnInit } from '@angular/core';
import { AudioService } from '../audio/audio.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Config } from './model/config';
import { ConfigService } from './config.service';
import { FullConfig } from './model/fullConfig';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss'
})
export class ConfigComponent implements OnInit {

  form: FormGroup;

  defaultConfig!: FullConfig;

  numWorkers = Array.from({ length: 100 }, (_, i) => {
    const val = (i + 1) * 5;
    return { label: val.toString(), value: val };
  });

  numSamples = Array.from({ length: ((5000 - 500) / 50 + 1) }, (_, i) => {
    const val = 500 + i * 50;
    return { label: val.toString(), value: val };
  });
  
  delays = [200, 300, 500, 750, 1000, 2000, 3000].map(val => ({
    label: val.toString(),
    value: val
  }));

  shifts = [
  { label: 'Mañana', startControl: 'morningStart', endControl: 'morningEnd' },
  { label: 'Tarde', startControl: 'afternoonStart', endControl: 'afternoonEnd' },
  { label: 'Noche', startControl: 'nightStart', endControl: 'nightEnd' }
];

  
  inferenceModels = [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly audiosService: AudioService,
    private readonly configService: ConfigService
  ) {
    this.form = this.formBuilder.group({
          nWorkers: [null],   
          nSamples: [null],  
          models: [null], 
          delay: [null],
        }); 
  }


  ngOnInit(): void {
    this.audiosService.getAvalaibleModels().subscribe(models => {this.inferenceModels = models
      console.log(models)
    });
    this.configService.getFullConfig().subscribe(config => {
      this.defaultConfig = config;
      console.log(config)
    })
  }
  
  parseForm(): Config {
    const formValue = this.form.value;
    return new Config({
      nWorkers: formValue.nWorkers,
      nSamples: formValue.nSamples,
      inferenceModel: formValue.models,
      silenceInterval: formValue.delay,
    });
  }

  save() {
    // Opción 1: Si quieres enviar lo que esté en el formulario (convertido a snake_case)
    const newConfig = this.parseForm(); // clase Config
  
    const finalData = {
      DEBUG: this.defaultConfig.debug,
      JWT_SECRET_KEY: this.defaultConfig.jwtSecretKey,
      SECRET_KEY: this.defaultConfig.secretKey,
      CORS_ORIGINS: this.defaultConfig.corsOrigins,
      UPLOAD_FOLDER: this.defaultConfig.uploadFolder,
      MAX_CONTENT_LENGTH: this.defaultConfig.maxContentLength,
      PORT: this.defaultConfig.port,
      SHIFTS: this.defaultConfig.shifts,
      GENERATION: {
        n_workers: newConfig.nWorkers ?? this.defaultConfig.generation.nWorkers,
        n_samples: newConfig.nSamples ?? this.defaultConfig.generation.nSamples
      },
      INFERENCE: {
        silence_interval: newConfig.silenceInterval ?? this.defaultConfig.inference.silenceInterval,
        inference_model: newConfig.inferenceModel ?? this.defaultConfig.inference.inferenceModel
      }
    };
    
    console.log(finalData)
  
    this.configService.changeConfig(finalData).subscribe({
      next: () => console.log('Config enviada al backend correctamente'),
      error: (err) => console.error('Error al enviar config:', err)
    });
  }
  
}
