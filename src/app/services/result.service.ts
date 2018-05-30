import {Injectable} from '@angular/core';
import Web3 from 'web3';
import result_registry from '../../../build/contracts/ResultRegistry.json';
import {Web3Service} from '../util/web3.service';
import {Result} from '../models/models';
import bs58 from 'bs58';

declare const Buffer;

@Injectable()
export class ResultService {
    private web3: Web3;
    private ResultRegistry: any;
    private currentAccount: string;

    constructor(private web3Service: Web3Service) {

        this.web3 = this.web3Service.getWeb3();

        web3Service.accountsObservable.subscribe(() => {
            this.web3.eth.getCoinbase().then(cb => {
                this.currentAccount = cb;
            });
        });

        this.web3Service.artifactsToContract(result_registry)
            .then(ResultRepo => {
                this.ResultRegistry = ResultRepo;
            });
    }

    async getResults() {
        console.log('getResults');
        this.currentAccount = await this.web3.eth.getCoinbase();

        let fetchedResults = [];

        let deployedResultRegistry = await this.ResultRegistry.deployed();
        try {
            let resultCount = await deployedResultRegistry.getResultCount.call(this.currentAccount, {from:this.currentAccount});
            resultCount = resultCount.toNumber();

            for(let i = 0; i < resultCount; ++i) {
                let result = await deployedResultRegistry.getResult.call(this.currentAccount, i, {from:this.currentAccount});
                console.log(result);
                let dataIpfsHash = bs58.encode(Buffer.from('1220' + result[0].slice(2), 'hex'));
                let passwordIpfsHash = bs58.encode(Buffer.from('1220' + result[1].slice(2), 'hex'));

                let resultToAdd = new Result(dataIpfsHash, passwordIpfsHash);
                fetchedResults.push(resultToAdd);
            }
            return fetchedResults;
        }catch (e) {
            console.log(e);
            console.error('Error occured while getting results.');
        }
    }
}
