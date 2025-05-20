export class Config {
    nWorkers!: number;
    nSamples!: number;
    inferenceModel!: string;
    silenceInterval!: number;
  
    constructor(init?: Partial<Config>) {
      Object.assign(this, init);
    }
  }
  