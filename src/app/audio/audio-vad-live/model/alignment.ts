/**
 * Clase para gestionar la alineación del texto con su audio correspondiente
 * Almacena cada letra, con su momento de inicio y de fin
 */
export class Alignment {
    word: string;
    start: number;
    end: number;
  
    constructor(end: number, start: number ,word: string ) {
      this.word = word;
      this.start = start;
      this.end = end;
    }
  }
  