import { Component, OnInit } from '@angular/core';
import { AudioService } from '../audio/audio.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Config } from './model/config';
import { ConfigService } from './config.service';
import { FullConfig } from './model/fullConfig';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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

  numSamples = Array.from({ length: ((10000 - 500) / 50 + 1) }, (_, i) => {
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
    private readonly configService: ConfigService,
    private router: Router
  ) {
    this.form = this.formBuilder.group({
      nWorkers: [null],
      nSamples: [null],
      models: [null],
      delay: [null],
      amOn: [false],
      amStart: [''],
      amEnd: [''],
      pmOn: [false],
      pmStart: [''],
      pmEnd: [''],
      ntOn: [false],
      ntStart: [''],
      ntEnd: ['']
    });
  }


  ngOnInit(): void {
    this.audiosService.getAvalaibleModels().subscribe(models => {
      this.inferenceModels = models;
    });
    this.configService.getFullConfig().subscribe(config => {
      this.defaultConfig = config;

      console.log(this.defaultConfig.inference)
      const shifts = this.defaultConfig.shifts;

      this.form.patchValue({
        nWorkers: this.defaultConfig.generation?.nWorkers ?? null,
        nSamples: this.defaultConfig.generation?.nSamples ?? null,
        delay: this.defaultConfig.inference?.silenceInterval ?? null,
        models: this.defaultConfig.inference?.inferenceModel ?? null,
        amStart: shifts?.['mañana']?.[0] || '',
        amEnd: shifts?.['mañana']?.[1] || '',
        pmStart: shifts?.['tarde']?.[0] || '',
        pmEnd: shifts?.['tarde']?.[1] || '',
        ntStart: shifts?.['noche']?.[0] || '',
        ntEnd: shifts?.['noche']?.[1] || ''
      });
      console.log(config)
    })
  }

  parseForm(): Config {
    const formValue = this.form.value;
    const shifts: { [key: string]: [string, string] } = {
      mañana: [formValue.amStart ?? '', formValue.amEnd ?? ''],
      tarde: [formValue.pmStart ?? '', formValue.pmEnd ?? ''],
      noche: [formValue.ntStart ?? '', formValue.ntEnd ?? '']
    };

    return new Config({
      nWorkers: formValue.nWorkers,
      nSamples: formValue.nSamples,
      inferenceModel: formValue.models,
      silenceInterval: formValue.delay,
      shifts: shifts
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
      SHIFTS: newConfig.shifts || this.defaultConfig.shifts,
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
      next: () => {
        Swal.fire("Configuración modificada", "", "success");
        this.routeToPrincipal();
        console.log('Config enviada al backend correctamente');
      },
      error: (err) => console.error('Error al enviar config:', err)
    });
  }

  routeToWorkers(): void {
    this.router.navigate(['/register']);
  }

    routeToPrincipal(): void {
    this.router.navigate(['/']);
  }

resetDefalut(): void {
  Swal.fire({
    title: '¿Restablecer la configuración por defecto?',
    text: 'La aplicación tomará los valores por defecto.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Continuar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.configService.resetConfig().subscribe(()=> {
        Swal.fire("Configuración reestablecida", "", "success");
        this.routeToPrincipal();
        console.log('Config enviada al backend correctamente');
      });
    }
  });
}



}
