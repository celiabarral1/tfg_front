import { Component, EventEmitter, Output } from '@angular/core';
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
  @Output() charTypeChange = new EventEmitter<string>();

  constructor(
    private readonly formBuilder:FormBuilder,
    private readonly service: IndividualService,
    private readonly chartDataService: ChartDataService // Transferencia de datos a gráfico
  ){
    this.form = this.formBuilder.group({
      userId: ['', Validators.required],   // Ejemplo de campo con validación
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
