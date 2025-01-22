export class Employee {
    id: string;
    name: string;
    surname: string;
    identification: string;
    workstation: string;
    hiringDate: Date;
    registrationDate: Date;
  
    constructor(id: string, name: string, surname: string, identification: string, workstation: string, 
        hiringDate: Date, registrationDate: Date) {
      this.id = id;
      this.name = name;
      this.surname = surname;
      this.identification = identification;
      this.workstation = workstation;
      this.hiringDate = hiringDate;
      this.registrationDate = registrationDate;
    }
  }
  