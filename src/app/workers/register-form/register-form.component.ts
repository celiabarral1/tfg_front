import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from '../model/employee';
import { EmployeeService } from '../employee.service';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss'
})
export class RegisterFormComponent {
  registerForm: FormGroup;
  

  constructor(private fb: FormBuilder, private employeeService: EmployeeService) {
    this.registerForm = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      identification: ['', Validators.required],
      workstation: [''],
      hiring_date: [''],
      registration_date: [''],
    });
  }

  parseForm(formValue: any): Employee {
    return new Employee(
      formValue.id,
      formValue.name,
      formValue.surname,
      formValue.identification,
      formValue.workstation,
      new Date(formValue.hiring_date),
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
