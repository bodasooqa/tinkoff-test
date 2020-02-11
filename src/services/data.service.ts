import { Injectable } from '@angular/core';
import { ITemp } from '../types';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private data: ITemp[] = [
    { t: '1881-01-01', v: -10.9 },
    { t: '1881-01-02', v: -4 },
    { t: '1881-01-03', v: -2.6 },
    { t: '1881-01-04', v: 0.1 },
    { t: '1881-01-05', v: 0.5 },
    { t: '1881-01-06', v: -8.8 },
    { t: '1881-01-07', v: -11.6 },
    { t: '1881-01-08', v: -13.3 }
  ];

  private getNumData(): number[] {
    return this.data.map(item => item.v);
  }

  public getData(): ITemp[] {
    return this.data;
  }

  public getValues(): number[] {
    return this.getNumData().sort();
  }

  public getDates(): string[] {
    return this.data.map(item => item.t);
  }

  public getMin(): number {
    return Math.min(...this.getNumData());
  }

  public getMax(): number {
    return Math.max(...this.getNumData());
  }
}
