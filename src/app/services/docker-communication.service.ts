import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {LoggerService} from './logger.service';
import {BdbService} from './bdb.service';

@Injectable()
export class DockerCommunicationService {
    private oracleServerUrl = 'http://127.0.0.1:8081';

    private EXEC_CREATE = this.oracleServerUrl + '/exec/create';
    private EXEC_START = this.oracleServerUrl + '/exec/run';

    constructor(
        private http: HttpClient,
        private bdbService: BdbService,
        private loggerService: LoggerService) {
    }

    execCreate(containerInfo, softwareInfo, dataset, pubUserKey): Observable<string> {
        let containerID = containerInfo.dockerID;
        let swIpfsHash = softwareInfo.ipfsHash;
        let datasetBdbId = dataset.bdbTxId;
        let post_data = {'id': containerID, 'swIpfsHash': swIpfsHash, 'datasetBdbId': datasetBdbId, 'pubUserKey': pubUserKey};
        return this.http.post<any>(this.EXEC_CREATE, post_data)
            .pipe(
                tap(_ => this.log('Exec instance created')),
                catchError(this.handleError('execCreate', ''))
            );
    }

    //TODO change to http.post???
    execStart(exec_id, paymentID): Observable<String> {
        let post_data = {'execId': exec_id, 'paymentID': paymentID};
        console.log(this.EXEC_START + '?id=' + exec_id);
        return this.http.post<any>(this.EXEC_START , post_data)
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
