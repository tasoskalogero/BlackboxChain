import { Injectable } from '@angular/core';
import {LoggerService} from './logger.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {catchError, tap} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';

@Injectable()
export class BigchaindbService {
  private serverUrl = 'http://127.0.0.1:8081';

  private TRANSACTION_CREATE = this.serverUrl+'/bcdb/transaction/create/data';

  constructor(private http: HttpClient,
              private loggerService: LoggerService) { }

  createTransaction(ipfsAddr: string, dsName: string, dsDescr: string, cost: string): Observable<string> {

    let post_data = {'ipfsAddr':ipfsAddr, 'dsName': dsName, 'dsDescr': dsDescr, 'cost':cost };
    return this.http.post<string>(this.TRANSACTION_CREATE, post_data)
      .pipe(
        tap(_ => console.log('Dataset stored on BigchainDB') ),
        catchError(this.handleError('BigchainDB: createTransaction', ''))
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
