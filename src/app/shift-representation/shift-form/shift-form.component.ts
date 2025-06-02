import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { IndividualService } from '../../individual/individual.service';
import { ChartDataService } from '../../shared/shared/chart-data.service';
import { Record } from '../../shared/shared/model/record';
import { AnalysisService } from '../../analysis/analysis.service';
import { Classification } from '../../analysis/model/classification';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import Swal from 'sweetalert2';

/**
 * Componente con el formulario para la búsqueda detallada de un turno de trabajadores.
 */
@Component({
  selector: 'app-shift-form',
  templateUrl: './shift-form.component.html',
  styleUrls: ['./shift-form.component.scss']
})
export class ShiftFormComponent implements OnInit {
  form: FormGroup;
  isDatesDisabled: boolean = false;
  selectedOption: string | null = null;
  shifts = [];
  options = [];
  showPopup = false;

  @Output() charTypeChange = new EventEmitter<string>();
  @ViewChild('startDate', { static: false }) startDate!: ElementRef;
  classificationData = new Classification();
  filteredClassification = new Classification();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly service: IndividualService,
    private readonly analysisService: AnalysisService,
    private readonly cdr: ChangeDetectorRef,
    private readonly chartDataService: ChartDataService,
    private readonly router: Router
  ) {
    this.form = this.formBuilder.group({
      shift: [null, Validators.required],
      time: [null],
      charType: ['1', Validators.required],
      startDate: [''],
      endDate: ['']
    }, { validators: [this.dateOrTimeValidator, this.dateValidator] });
  }


  /**
   * Recoge los periodos de tiempo establecidos y los turnos de los trabajadores a analizar.
   */
  ngOnInit(): void {
    this.service.getTimePeriods().subscribe(
      response => this.options = response,
      error => console.error('Error al obtener las opciones de tiempo:', error)
    );

    this.service.getShifts().subscribe(
      response => this.shifts = response,
      error => console.error('Error al obtener los turnos:', error)
    );

    this.analysisService.getClassification().subscribe({
      next: (response) => {
        this.classificationData = new Classification(
          response.no_disorder,
          response.depression,
          response.anxiety
        );
      },
      error: (error) => console.error('Error al obtener la clasificación:', error)
    });
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

  onTimeChange(value: any): void {
    const startDateControl = this.form.get('startDate');
    const endDateControl = this.form.get('endDate');

    if (value) {
      startDateControl?.disable();
      endDateControl?.disable();
      this.isDatesDisabled = true;
      this.form.patchValue({ startDate: '', endDate: '' });
    } else {
      startDateControl?.enable();
      endDateControl?.enable();
      this.isDatesDisabled = false;
    }
    this.form.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  onManualDate(): void {
    const time = this.form.get('time');
    const startDate = this.form.get('startDate');
    const endDate = this.form.get('endDate');

    if (startDate?.value || endDate?.value) {
      time?.disable();
      this.isDatesDisabled = false;
    } else {
      time?.enable();
    }
    this.form.updateValueAndValidity();
  }


  /**
   * Función que envía los datos del formulario y recibe los datos asociados a:
   * Turno laboral, tipo de emociones a representar (categóricas o dimensioanles)
   * fechas de los datos que se quieren conocer.
   * Valida los datos antes de enviarlos.
   * Se notifica al usuario si no hay datos o si hubiera algún error en su obtención.
   * Permite ver los participantes de los resultados, según su tendencia psicológica.
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.log('Formulario inválido:', this.form.errors);
      return;
    }

    const { shift, time, charType, startDate, endDate } = this.form.value;
    this.charTypeChange.emit(charType);

    const requestData: any = {
      shift: shift,
      char_type: charType
    };

    if (time) {
      requestData.time_option = time;
    } else {
      requestData.start_date = new Date(startDate).toISOString().split('T')[0];
      requestData.end_date = new Date(endDate).toISOString().split('T')[0];
    }

    this.service.filterByShifts(requestData).subscribe(
      response => {
        if (response.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'No hay datos',
            text: 'No se encontraron registros para los filtros seleccionados.',
            confirmButtonText: 'Aceptar'
          });
          return;
        }
        const userIds = response.user_ids;
        this.filteredClassification = new Classification(
          this.classificationData.no_disorder.filter(id => userIds.includes(id)),
          this.classificationData.depression.filter(id => userIds.includes(id)),
          this.classificationData.anxiety.filter(id => userIds.includes(id))
        );

        const records = response.data.flat().map((item: any) => new Record(item));
        this.chartDataService.updateChartData(records, time, shift);
        this.cdr.detectChanges();
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

  changePopUpState(event?: Event): void {
    if (event) event.preventDefault();

    this.chartDataService.chartData$.pipe(first()).subscribe(data => {
      if (data && data.data.length > 0) {
        this.showPopup = !this.showPopup;
        this.cdr.detectChanges();
      } else {
        console.warn('No hay datos disponibles para mostrar en el popup');
      }
    });
  }

  routeToRepresentation(id: number): void {
    this.router.navigate(['/representation', id]);
  }
}
