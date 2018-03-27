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
import {DockerCommunicationService} from './services/docker-communication.service';
import { LoggerComponent } from './components/logger/logger.component';
import {LoggerService} from './services/logger.service';
import { DatasetComponent } from './components/dataset/dataset.component';
import {DatasetService} from './services/dataset.service';
import {BigchaindbService} from './services/bigchaindb.service';
import { HomeComponent } from './components/home/home.component';
import { ContainerComponent } from './components/container/container.component';
import {ComputationLayoutComponent} from './components/layouts/computation-layout/computation-layout.component';
import {SoftwareComponent} from './components/software/software.component';
import {PubKeyUploadLayoutComponent} from './components/layouts/pubKeyUpload-layout/pubKeyUpload-layout.component';
import {DatasetLayoutComponent} from './components/layouts/dataset-layout/dataset-layout.component';
import {SoftwareLayoutComponent} from './components/layouts/software-layout/software-layout.component';
import {ContainerLayoutComponent} from './components/layouts/container-layout/container-layout.component';
import {CommunicationService} from './services/communication.service';



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
    PubKeyUploadLayoutComponent,
    DatasetComponent,
    DatasetLayoutComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [CommunicationService, ContainerService, SoftwareService, Web3Service, DockerCommunicationService, LoggerService, DatasetService, BigchaindbService],
  bootstrap: [AppComponent]
})
export class AppModule { }
