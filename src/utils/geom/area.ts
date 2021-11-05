import { Margin } from "./margin";

export class Area {
  constructor(
    public wrapperWidth: number,
    public wrapperHeight: number,
    public margin?: Margin
  ) {}

  get width(): number {
    return this.wrapperWidth - (this.margin.left + this.margin.right);
  }
  get height(): number {
    return this.wrapperHeight - (this.margin.top + this.margin.bottom);
  }
}
