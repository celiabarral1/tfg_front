import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { IndividualService } from '../individual.service';
import { ChartDataService } from '../../shared/shared/chart-data.service';
import { Record } from '../../shared/shared/model/record';
import Swal from 'sweetalert2';

/**
 * Componente con el formulario para la búsqueda detallada de un trabajador.
 */
@Component({
  selector: 'app-individual-form',
  templateUrl: './individual-form.component.html',
  styleUrls: ['./individual-form.component.scss']
})
export class IndividualFormComponent implements OnChanges, AfterViewInit {
  @Input() id: string | undefined | null;
  @Output() charTypeChange = new EventEmitter<string>();
  @ViewChild('startDate', { static: false }) startDate!: ElementRef;

  form: FormGroup;
  selectedOption: string | null = null;
  options = [];
  ids = [];
  isDatesDisabled: boolean = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly service: IndividualService,
    private readonly chartDataService: ChartDataService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = this.formBuilder.group({
      userId: [null, Validators.required],
      time: [null],
      charType: ['1', Validators.required],
      startDate: [''],
      endDate: ['']
    }, { validators: [this.dateOrTimeValidator, this.dateValidator] });

    // Activar/desactivar fechas según cambio en 'time'
    this.form.get('time')?.valueChanges.subscribe(value => {
      this.toggleDateInputs(!!value);
    });
  }

  /**
   * Recoge los periodos de tiempo establecidos y los ids de los trabajadores a analizar.
   */
  ngOnInit(): void {
    this.service.getTimePeriods().subscribe(
      response => this.options = response,
      error => console.error('Error al obtener las opciones de tiempo:', error)
    );

    this.service.getIds().subscribe(
      response => this.ids = response,
      error => console.error('Error al obtener los IDs:', error)
    );
  }

  ngAfterViewInit(): void {
    if (this.id) {
      this.form.patchValue({ userId: this.id });
      this.cdr.detectChanges();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && changes['id'].currentValue) {
      this.form.patchValue({ userId: Number(this.id) });
    }
  }

  toggleDateInputs(disabled: boolean): void {
    const startDate = this.form.get('startDate');
    const endDate = this.form.get('endDate');
    if (disabled) {
      startDate?.disable();
      endDate?.disable();
      this.form.patchValue({ startDate: '', endDate: '' });
    } else {
      startDate?.enable();
      endDate?.enable();
    }
    this.isDatesDisabled = disabled;
    this.cdr.detectChanges();
  }

  onTimeChange(value: any): void {
    this.toggleDateInputs(!!value);
    this.form.updateValueAndValidity();
  }

  onManualDate(): void {
    const time = this.form.get('time');
    if (this.form.get('startDate')?.value || this.form.get('endDate')?.value) {
      time?.disable();
      this.isDatesDisabled = false;
    } else {
      time?.enable();
    }
    this.form.updateValueAndValidity();
  }

  focusStartDate(): void {
    this.startDate?.nativeElement.focus();
  }

  dateOrTimeValidator(control: AbstractControl): ValidationErrors | null {
    const time = control.get('time');
    const startDate = control.get('startDate');
    const endDate = control.get('endDate');

    const interacted = time?.touched || startDate?.touched || endDate?.touched ||
                       time?.dirty || startDate?.dirty || endDate?.dirty;

    if (!interacted) return null;

    if (time?.value) return null;

    if (startDate?.value && endDate?.value) return null;

    return { dateOrTimeRequired: true };
  }

  dateValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate');
    const endDate = control.get('endDate');

    if (!startDate?.touched && !endDate?.touched) return null;

    if (startDate?.value && endDate?.value && new Date(startDate.value) > new Date(endDate.value)) {
      return { invalidDateRange: true };
    }
    return null;
  }

  /**
   * Función que envía los datos del formulario y recibe los datos asociados a:
   * ID introducido, tipo de emociones a representar (categóricas o dimensioanles)
   * fechas de los datos que se quieren conocer.
   * Valida los datos antes de enviarlos.
   * Se notifica al usuario si no hay datos o si hubiera algún error en su obtención.
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.log('Formulario inválido:', this.form.errors);
      return;
    }

    const { userId, time, charType, startDate, endDate } = this.form.value;
    this.charTypeChange.emit(charType);

    const requestData: any = {
      user_id: userId,
      char_type: charType
    };

    if (time) {
      requestData.time_option = time;
    } else {
      requestData.start_date = new Date(startDate).toISOString().split('T')[0];
      requestData.end_date = new Date(endDate).toISOString().split('T')[0];
    }

    this.service.filterRecords(requestData).subscribe(
      (response) => {
        if (response.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'No hay datos',
            text: 'No se encontraron registros para los filtros seleccionados.',
            confirmButtonText: 'Aceptar'
          });
          return;
        }

        const records = response.flat().map((item: any) => new Record(item));
        this.chartDataService.updateChartData(records, time, userId);
      },
      (error) => {
        console.error('Error al hacer la solicitud:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al obtener los datos. Intenta nuevamente.',
          confirmButtonText: 'Aceptar'
        });
      }
    );
  }

  onCharTypeChange(value: string): void {
    this.charTypeChange.emit(value);
  }
}
