/**
 * Clase utilizada para gestionar los grupos de trabajadores según la tendencia psicológica
 * que tienden a seguir.
 * Almacena en una lista los identificadores de los trabajadores ansiosos,
 * en otra la de los trabajadores depresivos y en otro los que no presentan
 * ningún trastorno.
 */
export class Classification {
    no_disorder: number[];
    depression: number[];
    anxiety: number[];
  
    constructor(
      no_disorder: number[] = [],
      depression: number[] = [],
      anxiety: number[] = []
    ) {
      this.no_disorder = no_disorder;
      this.depression = depression;
      this.anxiety = anxiety;
    }
  }
  