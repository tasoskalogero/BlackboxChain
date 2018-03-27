import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {LoggerService} from './logger.service';

@Injectable()
export class DockerCommunicationService {
  private serverUrl = 'http://127.0.0.1:8081';

  private EXEC_CREATE = this.serverUrl + '/exec/create';
  private EXEC_START = this.serverUrl + '/exec/run';

  constructor(
    private http: HttpClient,
    private loggerService: LoggerService) {
  }

  execCreate(containerID, softwareIPFSHash, bcdbTxIdDataset, pubUserKey): Observable<string> {
    let post_data = {'id':containerID, 'swIPFS': softwareIPFSHash, 'dataLoc': bcdbTxIdDataset, 'pubUserKey':pubUserKey};
    return this.http.post<any>(this.EXEC_CREATE, post_data)
      .pipe(
        tap(_ => this.log('Exec instance created')),
        catchError(this.handleError('execCreate', ''))
      );
  }

  //TODO change to http.post???
  execStart(exec_id ): Observable<String> {
    console.log(this.EXEC_START + '?id=' + exec_id);
    return this.http.get<string>(this.EXEC_START+'?execID='+exec_id)
      .pipe(
        tap(_ => this.log('Exec instance started')),
        catchError(this.handleError('execStart', ''))
      );
  }


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  private log(message: string) {
    this.loggerService.add(message);
  }
}
