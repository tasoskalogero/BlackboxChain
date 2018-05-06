import { Injectable } from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Container, Dataset, Software} from '../models/models';

@Injectable()
export class CommunicationService {

  private containerSource= new Subject<Container>();
  private softwareSource= new Subject<Software>();
  private datasetSource = new Subject<Dataset>();

  container$ = this.containerSource.asObservable();
  software$ = this.softwareSource.asObservable();
  dataset$ = this.datasetSource.asObservable();


  announceContainer(container: Container) {
    this.containerSource.next(container);
  }

  announceSoftware(sw: Software) {
    this.softwareSource.next(sw);
  }

  announceDataset(dataset: Dataset) {
    this.datasetSource.next(dataset);
  }
}
