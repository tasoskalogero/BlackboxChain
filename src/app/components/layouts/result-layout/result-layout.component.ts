import Web3 from 'web3';

import {Component, OnInit} from '@angular/core';
import result_registry from '../../../../../build/contracts/ResultRegistry.json';

import {Web3Service} from '../../../util/web3.service';
import {Result} from '../../../models/models';
import {ResultService} from '../../../services/result.service';

@Component({
    selector: 'app-result-layout',
    templateUrl: './result-layout.component.html',
    styleUrls: ['./result-layout.component.css']
})
export class ResultLayoutComponent implements OnInit {

    web3: Web3;
    currentAccount: string;
    ResultRegistry: any;
    fetchedResults: Result[];
    prevAccount: string;

    constructor(
        private resultService: ResultService,
        private web3Service: Web3Service) {

        this.web3 = this.web3Service.getWeb3();

        web3Service.accountsObservable.subscribe(() => {

            this.web3.eth.getCoinbase().then(cb => {
                if(this.prevAccount == null) {
                    this.prevAccount = cb;
                }
                this.currentAccount = cb;
                if(this.prevAccount != this.currentAccount) {
                    this.prevAccount = this.currentAccount;
                    this.refreshPage();
                }
            });
        });

        this.web3Service
            .artifactsToContract(result_registry)
            .then(resultRegistry => {
                this.ResultRegistry = resultRegistry;
            });

    }

    ngOnInit() {
        this.getResults();
    }

    getResults(): void {
        this.resultService.getResults().then(results => {
            this.fetchedResults = results;
        });
    }

    refreshPage(): void {
        window.location.reload();
    }
}
