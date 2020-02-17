import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ITemp } from '../../../types';
import { consoleTestResultHandler } from 'tslint/lib/test';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {
  // Определяем контекст канваса
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  // SVG слайдер
  @ViewChild('slider', { static: true }) slider: ElementRef<SVGElement>;
  @ViewChild('sliderAll', { static: true }) sliderAll: ElementRef<SVGRectElement>;
  @ViewChild('sliderRange', { static: true }) sliderRange: ElementRef<SVGRectElement>;

  private ctx: CanvasRenderingContext2D;

  sliderAllWidth: number;
  sliderRangeWidth: number;

  @Input() dataLength: number;

  moving = false;
  movingStart = null;
  rect = {
    x: 500,
    width: null
  };

  // Сетка
  xGrid = 20;
  yGrid = 20;

  // Базовые параметры графика
  maxHeight = 24;
  maxWidth = 48;
  step = 20;
  valStep = 0.5;
  xStartPoint = 4;
  valQty = 0;

  private readonly data: ITemp[];
  range: ITemp[];

  constructor(private dataService: DataService) {
    this.data = dataService.data;
  }

  // Отдает кол-во требуемых сегментов сетки
  private segment(value: number): number {
    return value * this.step;
  }

  // Отдает кол-во требуемых сегментов сетки
  private ySegment(value: number): number {
    return (value * (this.maxHeight * this.step) / this.valQty - 1) / 3;
  }

  // Минимальная точка на графике
  private minVal(): number {
    const roundMin = Math.round(this.dataService.getMin(this.range));

    // Округлять до ближайшего низшего
    return roundMin > this.dataService.getMin(this.range) ? roundMin - this.valStep : roundMin;
  }

  // Максимальная точка на графике
  private maxVal(): number {
    const roundMin = Math.round(this.dataService.getMax(this.range));

    // Если значение точки кратно шагу - оставлять, если нет - округлять до ближайшего высшего
    if (this.dataService.getMax(this.range) % this.valStep !== 0) {
      return roundMin < this.dataService.getMax(this.range) ? roundMin + this.valStep : roundMin;
    } else {
      return this.dataService.getMax(this.range);
    }
  }

  // Ограничение диапазона значений в графике
  private allRange(): number {
    return Math.abs(this.minVal()) + Math.abs(this.maxVal());
  }

  // Кратность значений оси Y
  rangeMultiplicity(): number {
    return Math.round(this.allRange() / 20);
  }

  // Начальная позиция на графике
  private getPos(value) {
    return (value - this.minVal()) / 0.5;
  }

  // Рисует сетку
  drawGrids(): void {
    this.ctx.save();
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

  // Рисует оси
  drawAxes(): void {
    let yPlot = 2 + this.maxHeight;
    let xPlot = this.xStartPoint;
    let valStep = this.minVal();

    this.ctx.beginPath();
    this.ctx.strokeStyle = '#000000';

    this.ctx.moveTo(this.segment(this.xStartPoint), this.segment(2));
    this.ctx.lineTo(this.segment(this.xStartPoint), this.segment(2 + this.maxHeight));
    this.ctx.lineTo(this.segment(48), this.segment(2 + this.maxHeight));

    this.ctx.textAlign = 'end';

    // Ось y
    while (valStep < this.maxVal() + this.valStep) {
      this.ctx.strokeText(String(valStep), this.segment(this.xStartPoint - 0.5), this.segment(yPlot));
      this.ctx.moveTo(this.segment(this.xStartPoint - 0.4), this.segment(yPlot));
      this.ctx.lineTo(this.segment(48), this.segment(yPlot));
      yPlot -= this.maxHeight / (this.allRange()) / 2 * this.rangeMultiplicity();
      valStep += this.valStep * this.rangeMultiplicity();
      this.valQty++;
    }

    // this.ctx.textAlign = 'start';

    // Ось x
    // for (const item of this.dataService.getDates(this.range)) {
    //   this.ctx.strokeText(item, this.segment(xPlot), this.segment(this.maxHeight + 3));
    //   xPlot += this.maxWidth / this.dataService.getDates(this.range).length - 0.1;
    // }

    this.ctx.stroke();
    console.log(yPlot);
  }

  // Рисует график
  drawChart(): void {
    // Устанавливаем начальную точку
    const startPos = this.getPos(this.range[0].v);
    let xPlot = 0;
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#1c93d8';

    this.ctx.moveTo(this.segment(this.xStartPoint), this.segment(26) - this.ySegment(startPos));
    this.ctx.translate(this.segment(this.xStartPoint), this.segment(26) - this.ySegment(startPos));
    // this.ctx.lineTo(this.segment(this.xStartPoint), this.ySegment(17) );

    for (let i = 0; i < this.range.length; i += Math.floor(this.range.length / 50)) {
      xPlot += this.maxWidth / this.dataService.getDates(this.range).length * 80;
      if (this.range[i] === this.range[0]) {
        continue;
      }

      this.ctx.lineTo(this.segment(xPlot), this.ySegment(-this.getPos(this.range[i].v) + startPos));
    }

    console.log(startPos, xPlot);
    this.ctx.stroke();
  }

  initChart() {
    this.ctx.restore();
    this.ctx.clearRect(0, 0, 1000, 600);
    this.drawGrids();
    this.drawAxes();
    this.drawChart();

    // console.log(this.allRange(), this.minVal(), this.maxVal(), this.range);
  }

  screenToSVGCoords(event) {
    return event.clientX - this.sliderRange.nativeElement.getBoundingClientRect().x;
  }

  setRange() {
    const piecesPerSegment = this.dataLength / this.sliderAllWidth;

    const startRangePoint = Math.floor(this.rect.x) * piecesPerSegment;
    const endRangePoint = Math.floor(this.rect.x + this.sliderRangeWidth) * piecesPerSegment;

    this.range = this.data.slice(startRangePoint, endRangePoint);

    this.initChart();
  }

  onMouseDown(event) {
    this.movingStart = this.screenToSVGCoords(event);
    this.moving = true;
  }

  @HostListener('mousemove', ['$event'])
  moveSlider(event) {
    if (this.moving) {
      const cursorPosition = event.offsetX - this.movingStart;

      if (cursorPosition >= 0 && cursorPosition + this.sliderRangeWidth <= this.sliderAllWidth) {
        this.rect.x = cursorPosition;
      } else if (cursorPosition < 0) {
        this.rect.x = 0;
      } else if (cursorPosition + this.sliderRangeWidth > this.sliderAllWidth) {
        this.rect.x = this.sliderAllWidth - this.sliderRangeWidth;
      }
    }
  }

  @HostListener('mouseup')
  onMouseUp() {
    if (this.moving) {
      this.setRange();
    }

    this.moving = false;
  }

  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');

    this.sliderAllWidth = this.sliderAll.nativeElement.width.baseVal.value;
    this.sliderRangeWidth = this.sliderRange.nativeElement.width.baseVal.value;

    this.setRange();
  }
}
