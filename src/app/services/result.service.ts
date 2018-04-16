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
        // this.watchForResult();
    }

    async getResults() {
        this.currentAccount = await this.web3.eth.getCoinbase();

        let fetchedResults = [];

        let deployedResultRegistry = await this.ResultRegistry.deployed();
        try {
            let results = await deployedResultRegistry.getResultsByAddress.call(this.currentAccount, {from:this.currentAccount});
            console.log("Results " + results);

            for(let i = 0; i < results.length; ++i) {
                // Create IPFS hash from 32 bytes - https://digioli.co.uk/2018/03/08/converting-ipfs-hash-32-bytes/
                let ipfsHash = bs58.encode(Buffer.from('1220' + results[i].slice(2), 'hex'));
                let resultToAdd = new Result(ipfsHash);
                fetchedResults.push(resultToAdd);
            }
            return fetchedResults;
        }catch (e) {
            console.log(e);
            console.error('Error occured while getting results.');
        }
    }

    async watchForResult() {
        let fetchedResults = [];
        let latestBlock = await this.web3.eth.getBlockNumber();

        let deployedResultRegistry = await this.ResultRegistry.deployed();
        console.log('Watching for results...');
        deployedResultRegistry.ResultAdded({fromBlock: latestBlock}, async (error, event) => {
            if (error) {
                console.log(error);
            } else {
                if (event.blockNumber !== latestBlock) {
                    console.log(event.args);
                    let result = event.args.result;
                    // Create IPFS hash from 32 bytes - https://digioli.co.uk/2018/03/08/converting-ipfs-hash-32-bytes/
                    let lengthen =  bs58.encode(Buffer.from('1220' + result.slice(2), 'hex'));

                    fetchedResults.push(lengthen);
                    // this.setTxStatus("ResultRegistry completed successfully");
                }
            }
            latestBlock = latestBlock + 1;
        });
    }
}
