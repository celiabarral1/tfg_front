import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IndividualService } from '../../individual/individual.service';
import { ChartDataService } from '../../shared/shared/chart-data.service';
import { Record } from '../../shared/shared/model/record';

@Component({
  selector: 'app-shift-form',
  templateUrl: './shift-form.component.html',
  styleUrl: './shift-form.component.scss'
})
export class ShiftFormComponent {
form: FormGroup;
isDatesDisabled: boolean = false;
  selectedOption: string | null = null; 
  shifts = [];
  options = [];
  @Output() charTypeChange = new EventEmitter<string>();

  constructor(
    private readonly formBuilder:FormBuilder,
    private readonly service: IndividualService,
    private readonly cdr: ChangeDetectorRef,
    private readonly chartDataService: ChartDataService // Transferencia de datos a gráfico
  ){
    this.form = this.formBuilder.group({
      shift: ['mañana', Validators.required],   // Ejemplo de campo con validación
      time: [null, Validators.required],
      charType: ['1', [Validators.required]] // 0 -> categórico, 1 dimensional
    });
    }

  ngOnInit(): void {
    this.service.getTimePeriods().subscribe(
      (response) => {
        this.options = response; 
      },
      (error) => {
        console.error('Error al obtener las opciones de tiempo:', error);
      }
    );
    this.service.getShifts().subscribe(
      (response) => {
        this.shifts = response; 
      },
      (error) => {
        console.error('Error al obtener los turnos:', error);
      }
    );

  }

  
  onTimeChange(value: any): void {
    console.log("change")
    const startDateControl = this.form.get('startDate');
    const endDateControl = this.form.get('endDate');
    const buttonDate = this.form.get('datePick');

    if (value) {
      // Si hay una opción seleccionada, deshabilitamos los campos de fecha
      startDateControl?.disable();
      endDateControl?.disable();
      this.isDatesDisabled = true;
    } else {
      // Si no hay selección, habilitamos los campos de fecha
      startDateControl?.enable();
      endDateControl?.enable();
      this.isDatesDisabled = false;
    }
    this.cdr.detectChanges();
  }

  onManualDate(): void {
    const startDateControl = this.form.get('startDate');
    const endDateControl = this.form.get('endDate');
    const timeControl = this.form.get('time'); // Control de la ventana temporal
  
    // Verifica si las fechas de inicio o fin están definidas
    if (startDateControl?.value || endDateControl?.value) {
      // Si alguna fecha está seleccionada, deshabilita la ventana temporal
      timeControl?.disable();
    } else {
      // Si no hay fechas seleccionadas, habilita la ventana temporal
      timeControl?.enable();
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const shift = this.form.value.shift;
      const time = this.form.value.time;
      const charType = this.form.value.charType;
      this.charTypeChange.emit(charType); // Para tipo de gráfico

      this.service.filterByShifts(shift, time).subscribe(
        (response) => {
          const flattenedData = response.flat();
           const records = flattenedData.map((item: any) => new Record(item));
           console.log('Datos RECORDS:', records);
           this.chartDataService.updateChartData(records,time,shift);
        },
        (error) => {
          console.error('Error al hacer la solicitud:', error);
        }
      );
    } else {
      console.log('Formulario inválido');
    }
  }

  onCharTypeChange(value: string): void {
    this.charTypeChange.emit(value); 
  }

}
