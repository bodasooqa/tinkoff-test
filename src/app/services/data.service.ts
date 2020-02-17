import { Injectable } from '@angular/core';
import { ITemp } from '../../types';
import { NetworkService } from './network.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public data: ITemp[] = [];

  private _dataLength: BehaviorSubject<number> = new BehaviorSubject(0);

  public get dataLength(): Observable<number> {
    return this._dataLength.asObservable();
  }

  constructor(private networkService: NetworkService) {}

  public getData(): void {
    this.networkService.getTemperature().subscribe((res: ITemp[]) => {
      this.data = res;

      this._dataLength.next(res.length);
    });
  }

  private getNumData(data): number[] {
    return data.map(item => item.v);
  }

  public getDates(data): string[] {
    return data.map(item => item.t);
  }

  public getMin(data): number {
    return Math.min(...this.getNumData(data));
  }

  public getMax(data): number {
    return Math.max(...this.getNumData(data));
  }
}
