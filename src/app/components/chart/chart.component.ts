import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ITemp } from '../../../types';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

let raf;

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  data$: Observable<ITemp[]>;
  public data: ITemp[];

  error$: Observable<HttpErrorResponse>;
  public error: HttpErrorResponse;

  firstDate: string = null;
  lastDate: string = null;

  firstRangeDate: string = null;
  lastRangeDate: string = null;

  moving = false;
  resize: string = null;
  movingStart = null;
  resizeStart = null;
  rect = {
    x: 700,
    width: 100
  };

  // Сетка
  fixedXGrid = 20;
  fixedYGrid = 20;

  // Базовые параметры графика
  maxHeight = 24;
  maxWidth = 48;
  step = 20;
  valStep = 0.5;
  xStartPoint = 4;

  valQty = 0;
  range: ITemp[];

  constructor(private dataService: DataService, private changeDetectorRef: ChangeDetectorRef) {
    this.data$ = dataService.data;
    this.error$ = dataService.error;
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
    return Math.floor(this.allRange() / 20);
  }

  // Начальная позиция на графике
  private getPos(value) {
    return (value - this.minVal()) / 0.5;
  }

  // Создаем новый canvas для предварительного рендеринга
  preCanvas(): HTMLCanvasElement {
    const preCanvas: HTMLCanvasElement = document.createElement('canvas');
    preCanvas.width = this.canvas.nativeElement.width;
    preCanvas.height = this.canvas.nativeElement.height;

    return preCanvas;
  }

  // Рендеринг
  render(preCanvas: HTMLCanvasElement): void {
    raf = requestAnimationFrame(() => {
      this.ctx.drawImage(preCanvas, 0, 0);
    });
  }

  // Рисует сетку
  drawGrids(): void {
    this.ctx.save();

    const preCanvas = this.preCanvas();
    const preCtx: CanvasRenderingContext2D = preCanvas.getContext('2d');

    preCtx.beginPath();

    let xGrid = this.fixedXGrid;
    let yGrid = this.fixedYGrid;

    while (yGrid < preCanvas.height) {
      preCtx.moveTo(0, yGrid);
      preCtx.lineTo(preCanvas.width, yGrid);
      yGrid += this.step;
    }

    while (xGrid < preCanvas.width) {
      preCtx.moveTo(xGrid, 0);
      preCtx.lineTo(xGrid, preCanvas.height);
      xGrid += this.step;
    }

    preCtx.strokeStyle = '#dddddd';
    preCtx.stroke();


    this.render(preCanvas);
  }

  // Рисует оси
  drawAxes(): void {
    let yPlot = 2 + this.maxHeight;
    let valStep = this.minVal();
    this.valQty = 0;

    const preCanvas = this.preCanvas();
    const preCtx: CanvasRenderingContext2D = preCanvas.getContext('2d');

    preCtx.beginPath();
    preCtx.strokeStyle = '#000000';

    preCtx.moveTo(this.segment(this.xStartPoint), this.segment(2));
    preCtx.lineTo(this.segment(this.xStartPoint), this.segment(2 + this.maxHeight));
    preCtx.lineTo(this.segment(48), this.segment(2 + this.maxHeight));

    preCtx.textAlign = 'end';

    // Ось y
    while (valStep < this.maxVal() + this.valStep) {
      preCtx.strokeText(String(valStep), this.segment(this.xStartPoint - 0.5), this.segment(yPlot));
      preCtx.moveTo(this.segment(this.xStartPoint - 0.4), this.segment(yPlot));
      preCtx.lineTo(this.segment(48), this.segment(yPlot));
      yPlot -= this.maxHeight / (this.allRange()) / 2 * this.rangeMultiplicity();
      valStep += this.valStep * this.rangeMultiplicity();
      this.valQty++;
    }

    preCtx.stroke();

    this.render(preCanvas);
  }

  // Рисует график
  drawChart(): void {
    // Устанавливаем начальную точку
    const startPos = this.getPos(this.range[0].v);
    let xPlot = 0;

    const preCanvas = this.preCanvas();
    const preCtx: CanvasRenderingContext2D = preCanvas.getContext('2d');

    preCtx.beginPath();
    preCtx.lineWidth = 3;

    preCtx.moveTo(this.segment(this.xStartPoint), this.segment(26) - this.ySegment(startPos));
    preCtx.translate(this.segment(this.xStartPoint), this.segment(26) - this.ySegment(startPos));

    for (let i = 0; i < this.range.length; i += Math.floor(this.range.length / 50)) {
      xPlot += this.maxWidth / this.dataService.getDates(this.range).length * 80;
      if (this.range[i] === this.range[0]) {
        continue;
      }

      preCtx.lineTo(this.segment(xPlot), this.ySegment(-this.getPos(this.range[i].v) + startPos));
    }

    preCtx.stroke();
    preCtx.beginPath();
    preCtx.strokeStyle = '#000000';
    preCtx.fillStyle = 'rgba(255, 221, 45, 0.7)';
    preCtx.lineWidth = 1;
    xPlot = 0;

    for (let i = 0; i < this.range.length; i += Math.floor(this.range.length / 50)) {
      xPlot += this.maxWidth / this.dataService.getDates(this.range).length * 80;
      if (this.range[i] === this.range[0]) {
        continue;
      }

      preCtx.fillRect(this.segment(xPlot - 0.2), this.ySegment(-this.getPos(this.range[i].v) + startPos - 3), 60, 15);
      preCtx.strokeText(this.range[i].t, this.segment(xPlot), this.ySegment(-this.getPos(this.range[i].v) + startPos));

      preCtx.stroke();
    }

    this.render(preCanvas);
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
    const piecesPerSegment = this.data.length / this.sliderAllWidth;

    const startRangePoint = Math.floor(this.rect.x) * piecesPerSegment;
    const endRangePoint = Math.floor(this.rect.x + this.rect.width) * piecesPerSegment;

    this.range = this.data.slice(startRangePoint, endRangePoint);

    this.firstRangeDate = this.range[0].t;
    this.lastRangeDate = this.range[this.range.length - 1].t;

    this.initChart();
  }

  moveRange(event) {
    this.movingStart = this.screenToSVGCoords(event);
    this.moving = true;
  }

  resizeRange(event, side) {
    this.movingStart = this.screenToSVGCoords(event);
    this.resize = side;
    this.resizeStart = event.offsetX - this.movingStart;

    console.log(side);
  }

  // Передвижение слайдера
  sliderMoving(pos: number): void {
    if (pos >= 0 && pos + this.rect.width <= this.sliderAllWidth) {
      this.rect.x = pos;
    } else if (pos < 0) {
      this.rect.x = 0;
    } else if (pos + this.rect.width > this.sliderAllWidth) {
      this.rect.x = this.sliderAllWidth - this.rect.width;
    }
  }

  // Изменение размера слайдера
  sliderResize(pos) {
    const minWidth = 100;
    if (this.resize === 'left') {
      if (pos >= 0) {
        this.rect.x = pos;
        this.rect.width = this.resizeStart - this.rect.x + this.sliderRangeWidth;
      }

      if (pos >= 0 && this.rect.width >= minWidth && pos + this.rect.width <= this.sliderAllWidth) {
        this.rect.x = pos;
      } else if (pos < 0) {
        this.rect.x = 0;
      } else if (this.sliderAllWidth - pos <= minWidth) {
        this.rect.x = this.sliderAllWidth - minWidth;
        this.rect.width = minWidth;
      } else if (this.rect.width < minWidth) {
        this.rect.width = minWidth;
      }
    }

    if (this.resize === 'right') {
      this.rect.width = pos - this.rect.x + this.sliderRangeWidth;
      if (this.rect.width <= minWidth) {
        this.rect.width = minWidth;
      } else if (this.rect.x + this.rect.width >= this.sliderAllWidth) {
        this.rect.width = this.sliderAllWidth - this.rect.x;
      }
    }
  }

  @HostListener('mousemove', ['$event'])
  moveSlider(event) {
    if (this.moving || this.resize) {
      const cursorPosition = event.offsetX - this.movingStart;

      if (this.moving) {
        raf = requestAnimationFrame(() => {
          this.sliderMoving(cursorPosition);
        });
      }

      if (this.resize) {
        raf = requestAnimationFrame(() => {
          this.sliderResize(cursorPosition);
        });
      }

      event.preventDefault();
    }
  }

  @HostListener('mouseup')
  onMouseUp() {
    if (this.moving || this.resize) {
      cancelAnimationFrame(raf);
    }

    if (this.moving) {
      this.setRange();
      this.moving = false;
    }

    if (this.resize) {
      this.sliderRangeWidth = this.rect.width;
      this.resize = null;
    }
  }

  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');

    this.error$.subscribe(res => {
      this.error = res;
      this.changeDetectorRef.detectChanges();
    });

    this.data$.subscribe(res => {
      this.data = res;

      if (this.data) {
        this.firstDate = this.dataService.getFirstDate(this.data);
        this.lastDate = this.dataService.getLastDate(this.data);

        this.sliderAllWidth = this.sliderAll.nativeElement.width.baseVal.value;
        this.sliderRangeWidth = this.rect.width;

        this.changeDetectorRef.detectChanges();

        this.setRange();
      }
    });
  }
}
