import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from '../model/employee';
import { EmployeeService } from '../employee.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

/**
 * Formulario para dar de alta a un trabajador de manera que pueda interactuar con la aplicación.
 */
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

  constructor(private fb: FormBuilder, private employeeService: EmployeeService , private router: Router) {
    this.dateNow = new Date().toISOString().split('T')[0];
    this.registerForm = this.fb.group({
      id: [null, Validators.required],
      rol: [null, Validators.required],
      registration_date: [this.dateNow, Validators.required]
    });
  }

  /**
   * Inicializa los roles disponibles para dar de alta, así como los ids
   * que son trabajadores pero aún no están autorizadas para interactuar con la app.
   */
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

  /**
   * Transforma los valores del formulario en un objeto empleado, 
   * los envía mediante una petición y se notifica si se inserta con éxito o si hay algún error.
   */
  onSubmit(): void {
    if (this.registerForm.valid) {
      const employeeToInsert = this.parseForm(this.registerForm.value); 

      this.employeeService.insertEmployee(employeeToInsert).subscribe(
        (response) => {
          console.log('Employee registered successfully:', response);  
          Swal.fire({
            icon: 'success',
            title: 'Alta completada',
            text: 'Trabajador dado de alta en WebEmotions.',
            confirmButtonText: 'Aceptar'
          });
          this.registerForm.reset();
        },
        (error) => {
          console.error('Error registering employee:', error);  
        }
      );
    } else {
      console.log('Formulario inválido');
      Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al dar de alta al usuario. Intenta nuevamente.',
                confirmButtonText: 'Aceptar'
      });
      this.registerForm.reset();
    }
  }

  backToConfig() {
    this.router.navigate(['/config']);
  }

}
