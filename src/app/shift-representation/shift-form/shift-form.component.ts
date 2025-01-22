import { Component, EventEmitter, Output } from '@angular/core';
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

  selectedOption: string | null = null; 
  shifts = [];
  options = [];
  @Output() charTypeChange = new EventEmitter<string>();

  constructor(
    private readonly formBuilder:FormBuilder,
    private readonly service: IndividualService,
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
