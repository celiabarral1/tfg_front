import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from '../model/employee';
import { EmployeeService } from '../employee.service';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss'
})
export class RegisterFormComponent implements OnInit{
  registerForm: FormGroup;
  roles: { label: string; value: string }[] = [];
  dateNow: string;
  ids = [];

  constructor(private fb: FormBuilder, private employeeService: EmployeeService) {
    this.dateNow = new Date().toISOString().split('T')[0];
    this.registerForm = this.fb.group({
      id: [null, Validators.required],
      rol: [null, Validators.required],
      registration_date: [this.dateNow, Validators.required]
    });
  }
  ngOnInit(): void {
    this.employeeService.getRols().subscribe(
      (response: { label: string; value: string }[]) => {
        this.roles = response;
        if (this.roles.length > 0) {
          this.registerForm.patchValue({ rol: this.roles[0].value });
        }
      },
      (error) => {
        console.error('Error al obtener las opciones de tiempo:', error);
      }
    );
    this.employeeService.getWorkersId().subscribe(
      (response) => {
        this.ids = response; 
      },
      (error) => {
        console.error('Error al obtener las opciones de tiempo:', error);
      }
    );
  }

  parseForm(formValue: any): Employee {
    return new Employee(
      formValue.id,
      formValue.rol,
      new Date(formValue.registration_date)
    );
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const employeeToInsert = this.parseForm(this.registerForm.value); 

      this.employeeService.insertEmployee(employeeToInsert).subscribe(
        (response) => {
          console.log('Employee registered successfully:', response);  // Cambia Worker a Employee
        },
        (error) => {
          console.error('Error registering employee:', error);  // Cambia Worker a Employee
        }
      );
    } else {
      console.log('Formulario inválido');
    }
  }

}
