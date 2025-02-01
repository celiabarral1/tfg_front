
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
  