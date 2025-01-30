import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IndividualService } from '../individual.service';
import { ChartDataService } from '../../shared/shared/chart-data.service';
import { Record } from '../../shared/shared/model/record';

@Component({
  selector: 'app-individual-form',
  templateUrl: './individual-form.component.html',
  styleUrls: ['./individual-form.component.scss']
})
export class IndividualFormComponent implements OnChanges {
  @Input() id: string | undefined | null;
  @Output() charTypeChange = new EventEmitter<string>();
  @ViewChild('startDate') startDate!: ElementRef;
  form: FormGroup;
  selectedOption: string | null = null; 
  options = [];
  isDatesDisabled: boolean = false;

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && changes['id'].currentValue) {
      this.form.patchValue({ userId: this.id });
    }
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
      const startDate = this.form.value.startDate;
      const endDate = this.form.value.endDate;
      this.charTypeChange.emit(charType); 

      const requestData: any = {
        user_id: userId,
        char_type: charType,
      };

      if(time) {
        requestData.time_option = time;
      } else {
        requestData.start_date = new Date(startDate).toISOString().split('T')[0]; // Formato YYYY-MM-DD
        requestData.end_date = new Date(endDate).toISOString().split('T')[0]; 
      }

      console.log(requestData)
       this.service.filterRecords(requestData).subscribe(
      (response) => {
        const flattenedData = response.flat();
        const records = flattenedData.map((item: any, index: number) => {
          try {
            console.log(`Processing item at index ${index}:`, item);
            return new Record(item);
          } catch (error) {
            console.error(`Error at index ${index}:`, item, error);
            throw error; // Rethrow the error to preserve behavior
          }
        });

        console.log('Datos RECORDS:', records);
        this.chartDataService.updateChartData(records, time, userId);
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
