import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { IndividualService } from '../individual.service';
import { ChartDataService } from '../../shared/shared/chart-data.service';
import { Record } from '../../shared/shared/model/record';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-individual-form',
  templateUrl: './individual-form.component.html',
  styleUrls: ['./individual-form.component.scss']
})
export class IndividualFormComponent implements OnChanges {
  @Input() id: string | undefined | null;
  @Output() charTypeChange = new EventEmitter<string>();
  @ViewChild('startDate', { static: false }) startDate!: ElementRef;  // Recuperado

  form: FormGroup;
  selectedOption: string | null = null; 
  options = [];
  isDatesDisabled: boolean = false;
  ids= [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly service: IndividualService,
    private readonly chartDataService: ChartDataService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = this.formBuilder.group({
      userId: [null, Validators.required],   
      time: [null],  
      charType: ['1', [Validators.required]], 
      startDate: [''],
      endDate: [''],
    }, { validators: [this.dateOrTimeValidator, this.dateRangeValidator] });  
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
    this.service.getIds().subscribe(
      (response) => {
        this.ids = response; 
        console.log(response)
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

  dateOrTimeValidator(control: AbstractControl): ValidationErrors | null {
    const time = control.get('time')?.value;
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (time || (startDate && endDate)) {
      return null;  
    }
    return { dateOrTimeRequired: true }; 
  }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
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
    } else {
      startDateControl?.enable();
      endDateControl?.enable();
      this.isDatesDisabled = false;
    }
    this.form.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  onManualDate(): void {
    const timeControl = this.form.get('time');

    if (this.form.get('startDate')?.value || this.form.get('endDate')?.value) {
      timeControl?.disable();
    } else {
      timeControl?.enable();
    }
    this.form.updateValueAndValidity();
  }

  focusStartDate() {  // ← Recuperado
    if (this.startDate) {
      this.startDate.nativeElement.focus();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.log('Formulario inválido:', this.form.errors);
      return;
    }
  
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
  
    if (time) {
      requestData.time_option = time;
    } else {
      requestData.start_date = new Date(startDate).toISOString().split('T')[0]; 
      requestData.end_date = new Date(endDate).toISOString().split('T')[0];
    }
  
    console.log(requestData);
    this.service.filterRecords(requestData).subscribe(
      (response) => {
        if (response.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'No hay datos',
            text: 'No se encontraron registros para los filtros seleccionados.',
            confirmButtonText: 'Aceptar'
          });
          return;  // Detener ejecución si no hay datos
        }
  
        const records = response.flat().map((item: any, index: number) => {
          try {
            console.log(`Processing item at index ${index}:`, item);
            return new Record(item);
          } catch (error) {
            console.error(`Error at index ${index}:`, item, error);
            throw error;
          }
        });
  
        console.log('Datos RECORDS:', records);
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
