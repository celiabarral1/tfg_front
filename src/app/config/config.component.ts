import { Component, OnInit } from '@angular/core';
import { AudioService } from '../audio/audio.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Config } from './model/config';
import { ConfigService } from './config.service';
import { FullConfig } from './model/fullConfig';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

/**
 * Componente que permite al usuario modificar parámetros de la configuración por defecto
 * o volver a ella.
 * También permite generar una nueva muestra de datos para explotar.
 */
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


  inferenceModels = [];

  newFile = 'estocastic_data_reconfig.csv';
  defaultFile = 'estocastic_data_reconfig.csv';

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
      ntEnd: [''],
      port: [null],
      alignmentPort: [null],
      newData: [false] 
    });
  }


  /**
   * Inicia el componente. Trae del almacenamiento los modelos de inferencia entre los que puede escoger el usuario.
   * Se rellenea con los valores de la configuración actual.
   */
  ngOnInit(): void {
    this.audiosService.getAvalaibleModels().subscribe(models => {
      this.inferenceModels = models;
    });
    this.configService.getFullConfig().subscribe(config => {
      this.defaultConfig = config;

      console.log(this.defaultConfig.inference)
      const shifts = this.defaultConfig.shifts;

      const model = (this.inferenceModels as { label: string; value: string }[])
      .find(model => model.value === this.defaultConfig.inference?.inferenceModel + '.pkl');


      this.form.patchValue({
        nWorkers: this.defaultConfig.generation?.nWorkers ?? null,
        nSamples: this.defaultConfig.generation?.nSamples ?? null,
        delay: this.defaultConfig.inference?.silenceInterval ?? null,
        models: model?.value ?? null,
        amStart: shifts?.['mañana']?.[0] || '',
        amEnd: shifts?.['mañana']?.[1] || '',
        pmStart: shifts?.['tarde']?.[0] || '',
        pmEnd: shifts?.['tarde']?.[1] || '',
        ntStart: shifts?.['noche']?.[0] || '',
        ntEnd: shifts?.['noche']?.[1] || '',
        port: this.defaultConfig.port ?? '',
        alignmentPort: this.defaultConfig.alignmentPort ?? '',
        newData: false
      });
      console.log(config)
    })
  }

  /**
   * Transforma los datos del formulario en un objeto Config
   * @returns nueva Configuración
   */
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

  /**
   * Transforma los datos del formulario en un objeto Config, completa el resto de datos 
   * con los de la configuración por defecto
   * Llama al servicio de configuración para que realice la petición de cambiar configuración y 
   * si se ha marcado la opción, genere una nueva muestra de datos.
   */
  save() {
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
        this.configService.changeFileWithData(this.newFile).subscribe({
          next: () => {
            console.log('Archivo cambiado correctamente');
            Swal.fire("Configuración modificada y datos actualizados", "", "success");
            this.routeToPrincipal();
          },
          error: (err: any) => {
            console.error('Error al cambiar archivo de datos', err);
            Swal.fire("Configuración guardada, pero hubo un error cargando los datos", "", "warning");
            this.routeToPrincipal();
          }
        });
      },
      error: (err) => console.error('Error al enviar config:', err)
    });
  }

  /**
   * Redirección al alta de trabajadores
   */
  routeToWorkers(): void {
    this.router.navigate(['/register']);
  }

  /**
   * Redirección a la pantalla principal
   */
  routeToPrincipal(): void {
    this.router.navigate(['/']);
  }

  /**
   * Reestablece la configuración por defecto.
   */
resetDefault(): void {
  Swal.fire({
    title: '¿Restablecer la configuración por defecto?',
    text: 'La aplicación tomará los valores por defecto.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Continuar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.configService.resetConfig().subscribe({
        next: () => {
          // Ahora cambiamos el archivo activo a los datos por defecto
          this.configService.changeFileWithData(this.defaultFile).subscribe({
            next: () => {
              Swal.fire("Configuración reestablecida", "", "success");
              this.routeToPrincipal();
              console.log('Config por defecto cargada y datos reiniciados');
            },
            error: (err: any) => {
              Swal.fire("La configuración fue restablecida, pero falló la carga de datos", "", "warning");
              this.routeToPrincipal();
              console.error('Error al cambiar archivo después del reset:', err);
            }
          });
        },
        error: err => {
          Swal.fire("Error al restablecer configuración", "", "error");
          console.error('Error al resetear configuración:', err);
        }
      });
    }
  });
}



}
