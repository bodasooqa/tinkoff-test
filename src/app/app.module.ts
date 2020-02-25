import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ChartComponent } from './components/chart/chart.component';
import { PreloaderComponent } from './components/preloader/preloader.component';
import { DataTypeComponent } from './pages/data-type/data-type.component';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  { path: '', redirectTo: 'temperature', pathMatch: 'full' },
  { path: 'temperature', component: DataTypeComponent },
  { path: 'precipitation', component: DataTypeComponent },
  { path: '**', redirectTo: 'temperature' }
];

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    PreloaderComponent,
    DataTypeComponent
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
