import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ChartComponent } from './components/chart/chart.component';
import { PreloaderComponent } from './components/preloader/preloader.component';
import { TemperatureComponent } from './pages/temperature/temperature.component';
import { RouterModule, Routes } from '@angular/router';
import { PrecipitationComponent } from './pages/precipitation/precipitation.component';


const routes: Routes = [
  { path: '', redirectTo: 'temperature', pathMatch: 'full' },
  { path: 'temperature', component: TemperatureComponent },
  { path: 'precipitation', component: PrecipitationComponent },
  { path: '**', redirectTo: 'temperature' }
];

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    PreloaderComponent,
    TemperatureComponent,
    PrecipitationComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
