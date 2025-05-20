export interface FullConfig {
    debug: boolean;
    jwtSecretKey: string;
    secretKey: string;
    corsOrigins: string;
    uploadFolder: string;
    maxContentLength: number;
    port: number;
    shifts: { [key: string]: [string, string] };
    generation: {
      nWorkers: number;
      nSamples: number;
    };
    inference: {
      silenceInterval: number;
      inferenceModel: string;
    };
  }
  