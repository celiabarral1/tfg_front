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
      charType: ['1', [Validators.required]],
      startDate: [''],
      endDate: [''],
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
      startDateControl?.disable();
      endDateControl?.disable();
      this.isDatesDisabled = true;
    } else {
      startDateControl?.enable();
      endDateControl?.enable();
      this.isDatesDisabled = false;
    }
    this.cdr.detectChanges();
  }

  onManualDate(): void {
    const startDateControl = this.form.get('startDate');
    const endDateControl = this.form.get('endDate');
    const timeControl = this.form.get('time'); 
  
    if (startDateControl?.value || endDateControl?.value) {
      timeControl?.disable();
    } else {
      timeControl?.enable();
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const shift = this.form.value.shift;
      const time = this.form.value.time;
      const charType = this.form.value.charType;
      const startDate = this.form.value.startDate;
      const endDate = this.form.value.endDate;
      this.charTypeChange.emit(charType); 

      const requestData: any = {
        shift: shift,
        char_type: charType,
      };

      if(time) {
        requestData.time_option = time;
      } else {
        requestData.start_date = new Date(startDate).toISOString().split('T')[0]; 
        requestData.end_date = new Date(endDate).toISOString().split('T')[0]; 
      }

      console.log(requestData)
      this.service.filterByShifts(requestData).subscribe(
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
