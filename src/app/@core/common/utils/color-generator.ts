
export class ColorGenerator {
  private min: number = 0;
  private max: number = 255;

  random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  randomColor(): string {
    return `rgba(${this.random(this.min, this.max)}, ${this.random(this.min, this.max)}, ${this.random(this.min, this.max)}, 0.5)`;
  }
}
