import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-temperature',
  templateUrl: './temperature.component.html',
  styleUrls: ['./temperature.component.scss']
})
export class TemperatureComponent implements OnInit, OnDestroy {
  private _currentPath: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private urlSubscription: Subscription;

  public get currentPath() {
    return this._currentPath.asObservable();
  }

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.urlSubscription = this.route.url.subscribe((url: UrlSegment[]) => {
      this._currentPath.next(url[0].path);
    });
  }

  ngOnDestroy(): void {
    this.urlSubscription.unsubscribe();
  }
}
