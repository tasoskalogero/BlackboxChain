import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AppComponent } from './app.component';
import {ContainerService} from './services/container.service';
import {HttpClientModule} from '@angular/common/http';
import {PageNotFoundComponent} from './components/page-not-found.component';
import {AppRoutingModule} from './app-routing.module';
import {SoftwareService} from './services/software.service';
import {Web3Service} from './util/web3.service';
import { LoggerComponent } from './components/logger/logger.component';
import {LoggerService} from './services/logger.service';
import { DatasetComponent } from './components/dataset/dataset.component';
import {DatasetService} from './services/dataset.service';
import { HomeComponent } from './components/home/home.component';
import { ContainerComponent } from './components/container/container.component';
import {ComputationLayoutComponent} from './components/layouts/computation-layout/computation-layout.component';
import {SoftwareComponent} from './components/software/software.component';
import {DatasetLayoutComponent} from './components/layouts/dataset-layout/dataset-layout.component';
import {SoftwareLayoutComponent} from './components/layouts/software-layout/software-layout.component';
import {ContainerLayoutComponent} from './components/layouts/container-layout/container-layout.component';
import {CommunicationService} from './services/communication.service';
import {OrderService} from './services/order.service';
import {BcdbService} from './services/bcdb.service';
import {ResultLayoutComponent} from './components/layouts/result-layout/result-layout.component';
import {ResultService} from './services/result.service';



@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    HomeComponent,
    LoggerComponent,
    ComputationLayoutComponent,
    SoftwareComponent,
    SoftwareLayoutComponent,
    ContainerComponent,
    ContainerLayoutComponent,
    DatasetComponent,
    DatasetLayoutComponent,
    ResultLayoutComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [CommunicationService, ContainerService, SoftwareService, Web3Service, LoggerService, DatasetService, BcdbService, OrderService, ResultService],
  bootstrap: [AppComponent]
})
export class AppModule { }
