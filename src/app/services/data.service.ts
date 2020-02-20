import { Injectable } from '@angular/core';
import { ITemp } from '../../types';
import { NetworkService } from './network.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _data: BehaviorSubject<ITemp[]> = new BehaviorSubject(null);
  public get data(): Observable<ITemp[]> {
    return this._data.asObservable();
  }

  private _error: BehaviorSubject<HttpErrorResponse> = new BehaviorSubject(null);
  public get error(): Observable<HttpErrorResponse> {
    return this._error.asObservable();
  }

  constructor(private networkService: NetworkService) {}

  static getNumData(data: ITemp[]): number[] {
    return data.map(item => item.v);
  }

  public getData(type: string): void {
    this.networkService[`get_${type}`]().subscribe(
      (res: ITemp[]) => {
        this._data.next(res);
      },
      (error: HttpErrorResponse) => {
        this._error.next(error);
        return throwError('Oops :(');
      }
    );
  }

  public getDates(data: ITemp[]): string[] {
    return data.map(item => item.t);
  }

  public getMin(data: ITemp[]): number {
    return Math.min(...DataService.getNumData(data));
  }

  public getMax(data: ITemp[]): number {
    return Math.max(...DataService.getNumData(data));
  }

  getFirstDate(data: ITemp[]) {
    return data[0].t;
  }

  getLastDate(data: ITemp[]) {
    return data[data.length - 1].t;
  }
}
