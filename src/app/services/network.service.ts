import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private url: string = environment.API_URL;

  constructor(private httpClient: HttpClient) { }

  public getTemperature() {
    return this.httpClient.get(`${this.url}/temperature`);
  }

  public getPrecipitation() {
    return this.httpClient.get(`${this.url}/precipitation`);
  }
}
