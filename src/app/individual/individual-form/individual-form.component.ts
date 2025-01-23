import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IndividualService } from '../individual.service';
import { ChartDataService } from '../../shared/shared/chart-data.service';
import { Record } from '../../shared/shared/model/record';

@Component({
  selector: 'app-individual-form',
  templateUrl: './individual-form.component.html',
  styleUrls: ['./individual-form.component.scss']
})
export class IndividualFormComponent {
  form: FormGroup;
  selectedOption: string | null = null; 
  options = [];
  isDatesDisabled: boolean = false;
  @Output() charTypeChange = new EventEmitter<string>();
  @ViewChild('startDate') startDate!: ElementRef;

  constructor(
    private readonly formBuilder:FormBuilder,
    private readonly service: IndividualService,
    private readonly chartDataService: ChartDataService ,// Transferencia de datos a gráfico,
    private readonly cdr: ChangeDetectorRef
  ){
    this.form = this.formBuilder.group({
      userId: ['', Validators.required],   // Ejemplo de campo con validación
      time: [null, Validators.required],
      charType: ['1', [Validators.required]] ,// 0 -> categórico, 1 dimensional
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

  focusStartDate() {
    this.startDate.nativeElement.focus();
  }

  onSubmit(): void {
    if (this.form.valid) {
      const userId = this.form.value.userId;
      const time = this.form.value.time;
      const charType = this.form.value.charType;
      this.charTypeChange.emit(charType); // Para tipo de gráfico

      this.service.filterRecords(userId, time).subscribe(
        (response) => {
          const flattenedData = response.flat();
           const records = flattenedData.map((item: any) => new Record(item));
           console.log('Datos RECORDS:', records);
           this.chartDataService.updateChartData(records,time,userId);
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
