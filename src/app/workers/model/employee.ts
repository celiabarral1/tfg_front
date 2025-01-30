export class Employee {
    id: string;
    rol: string;
    registrationDate: Date;
  
    constructor(id: string,rol:string,registrationDate: Date) {
      this.id = id;
      this.rol = rol;
      this.registrationDate = registrationDate;
    }
  }
  