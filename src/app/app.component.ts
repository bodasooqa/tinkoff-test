import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ITemp } from '../types';
import { DataService } from './services/data.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public dataLength: number;

  constructor(private dataService: DataService) {
    this.dataService.getData();

    this.dataService.dataLength.subscribe(res => {
      this.dataLength = res;
    });
  }

  ngOnInit(): void {

  }
}
