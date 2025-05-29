export class Config {
    nWorkers!: number;
    nSamples!: number;
    inferenceModel!: string;
    silenceInterval!: number;
    shifts: { [key: string]: [string, string]; } | null | undefined;
    
    constructor(init?: Partial<Config>) {
      Object.assign(this, init);
    }
  }
  