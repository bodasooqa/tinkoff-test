import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../services/data.service';
import { ITemp } from '../types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;

  // Grid size
  xGrid = 20;
  yGrid = 20;

  maxHeight = 24;
  maxWidth = 48;
  step = 20;
  valStep = 0.5;
  private readonly startPoint = 4;

  data: ITemp[];
  values: number[];

  constructor(private dataService: DataService) {
    this.data = dataService.getData();
    this.values = dataService.getValues();
  }

  drawGrids(): void {
    this.ctx.beginPath();

    while (this.xGrid < this.canvas.nativeElement.height) {
      this.ctx.moveTo(0, this.xGrid);
      this.ctx.lineTo(this.canvas.nativeElement.width, this.xGrid);
      this.xGrid += this.step;
    }

    while (this.yGrid < this.canvas.nativeElement.width) {
      this.ctx.moveTo(this.yGrid, 0);
      this.ctx.lineTo(this.yGrid, this.canvas.nativeElement.height);
      this.yGrid += this.step;
    }

    this.ctx.strokeStyle = '#dddddd';
    this.ctx.stroke();
  }

  private segment(value): number {
    return value * this.step;
  }

  private minVal(): number {
    const roundMin = Math.round(this.dataService.getMin());

    return roundMin > this.dataService.getMin() ? roundMin - this.valStep : roundMin;
  }

  private maxVal(): number {
    const roundMin = Math.round(this.dataService.getMax());

    if (this.dataService.getMax() % this.valStep !== 0) {
      return roundMin < this.dataService.getMax() ? roundMin + this.valStep : roundMin;
    } else {
      return this.dataService.getMax();
    }
  }

  private allRange(): number {
    return Math.abs(this.minVal()) + Math.abs(this.maxVal());
  }

  drawAxes(): void {
    let yPlot = 2 + this.maxHeight;
    let xPlot = this.startPoint;
    let valStep = this.minVal();
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#000000';

    this.ctx.moveTo(this.segment(this.startPoint), this.segment(2));
    this.ctx.lineTo(this.segment(this.startPoint), this.segment(2 + this.maxHeight));
    this.ctx.lineTo(this.segment(48), this.segment(2 + this.maxHeight));

    this.ctx.textAlign = 'end';

    for (let i = 0; i < this.allRange() * 2 + 1; i++) {
      this.ctx.strokeText(String(valStep), this.segment(this.startPoint - 0.5), this.segment(yPlot));
      yPlot -= this.maxHeight / (this.allRange()) / 2;
      valStep += this.valStep;
    }

    this.ctx.textAlign = 'start';

    for (const item of this.dataService.getDates()) {
      this.ctx.strokeText(item, this.segment(xPlot), this.segment(this.maxHeight + 3));
      xPlot += this.maxWidth / this.dataService.getDates().length - 0.1;
    }

    this.ctx.stroke();
  }

  drawChart(): void {
    this.ctx.beginPath();
    this.ctx.moveTo(this.segment(this.startPoint), this.segment(26));
    this.ctx.lineTo(this.segment(8), this.segment(14));
    this.ctx.lineTo(this.segment(10), this.segment(20));
    this.ctx.lineTo(this.segment(12), this.segment(10));
    this.ctx.lineTo(this.segment(12), this.segment(10));
    this.ctx.stroke();
  }

  initChart() {
    this.drawGrids();
    this.drawAxes();
    this.drawChart();
  }

  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');

    this.initChart();
  }
}
