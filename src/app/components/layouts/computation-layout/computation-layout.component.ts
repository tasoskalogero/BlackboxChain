import {Component, OnInit, ViewChild} from '@angular/core';
import {CommunicationService} from '../../../services/communication.service';
import {SoftwareLayoutComponent} from '../software-layout/software-layout.component';
import {ContainerLayoutComponent} from '../container-layout/container-layout.component';
import {DockerCommunicationService} from '../../../services/docker-communication.service';
import {LoggerService} from '../../../services/logger.service';
import {PubKeyUploadLayoutComponent} from '../pubKeyUpload-layout/pubKeyUpload-layout.component';
import {Container, Dataset, Software} from '../../../models/models';
import {DatasetLayoutComponent} from '../dataset-layout/dataset-layout.component';
import {Web3Service} from '../../../util/web3.service';
import {OrderService} from '../../../services/order.service';
import Web3 from 'web3';
import result_manager from '../../../../../build/contracts/ResultManager.json';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
// import * as ipfsAPI from 'ipfs-api';

// declare const Buffer;

@Component({
    selector: 'app-computation-layout',
    templateUrl: './computation-layout.component.html',
    styleUrls: ['./computation-layout.component.css'],
    providers: [CommunicationService]
})
export class ComputationLayoutComponent implements OnInit {
    @ViewChild(SoftwareLayoutComponent)
    private softwareDisplayComponent: SoftwareLayoutComponent;

    @ViewChild(ContainerLayoutComponent)
    private containerDisplayComponent: ContainerLayoutComponent;

    // @ViewChild(PubKeyUploadLayoutComponent)
    // private pubKeyUploadDisplayComponent: PubKeyUploadLayoutComponent;

    @ViewChild(DatasetLayoutComponent)
    private datasetDisplayComponent: DatasetLayoutComponent;

    pubKeyIpfsHash: string;
    pubKeyForm: FormGroup;
    web3: Web3;
    container: Container;
    software: Software;
    pubKeyIpfs: string;

    // uploadedUserPubKeyFile: File;
    dataset: Dataset;
    currentAccount: string;
    prevAccount: string;
    ResultManager: any;
    // ipfsApi: any;
    private txStatus: string;

    constructor(
        private fb: FormBuilder,
        private web3Service: Web3Service,
        private communicationService: CommunicationService,
        private dockerCommunicationService: DockerCommunicationService,
        private orderService: OrderService,
        private loggerService: LoggerService
    ) {
        communicationService.container$.subscribe(cont => {
            this.container = cont;
        });

        communicationService.software$.subscribe(sw => {
            this.software = sw;
        });

        communicationService.dataset$.subscribe(ds => {
            this.dataset = ds;
        });

        // communicationService.uploadedUserPubKey$.subscribe(file => {
        //     this.uploadedUserPubKeyFile = file;
        // });

        this.web3 = this.web3Service.getWeb3();

        web3Service.accountsObservable.subscribe(() => {

            this.web3.eth.getCoinbase().then(cb => {
                if(this.prevAccount == null) {
                    this.prevAccount = cb;
                }
                this.currentAccount = cb;
                if(this.prevAccount != this.currentAccount) {
                    this.prevAccount = this.currentAccount;
                    // this.refreshPage();
                }
            });
        });

        this.web3Service
            .artifactsToContract(result_manager)
            .then(resultManager => {
                this.ResultManager = resultManager;
            });
        this.watchForError().then();
        this.watchForResult().then();

        // this.ipfsApi = ipfsAPI('localhost', '5001',{protocol: 'https'});
    }

    private createForm() {
        this.pubKeyForm = this.fb.group({
            pubKeyIpfs: ['', Validators.required],
        });
    }

    ngOnInit() {
        this.createForm();
    }

    async watchForError() {
        let latestBlock = await this.web3.eth.getBlockNumber();
        let deployedResultManager = await this.ResultManager.deployed();
        console.log('Watching for errors...');
        deployedResultManager.ResultError({fromBlock: latestBlock}, async (error, event) => {
            if (error) {
                console.log(error);
            } else {
                if (event.blockNumber !== latestBlock) {
                    console.log(event.args);
                    this.setTxStatus('Computation failed.');
                    this.loggerService.add(this.web3.utils.toAscii(event.args.errorMsg));
                    this.loggerService.add('Funds returned to address ' + this.currentAccount);
                }
            }
            latestBlock = latestBlock + 1;
        });
    }

    async watchForResult() {
        let latestBlock = await this.web3.eth.getBlockNumber();
        let deployedResultManager = await this.ResultManager.deployed();
        console.log('Watching for results...');
        deployedResultManager.ResultAdded({fromBlock: latestBlock}, async (error, event) => {
            if (error) {
                console.log(error);
            } else {
                if (event.blockNumber !== latestBlock) {
                    console.log(event.args);
                    // let result = event.args.result;
                    // Create IPFS hash from 32 bytes - https://digioli.co.uk/2018/03/08/converting-ipfs-hash-32-bytes/
                    // let lengthen =  bs58.encode(Buffer.from('1220' + result.slice(2), 'hex'));

                    this.setTxStatus('Result stored successfully.');
                    this.loggerService.add("Transaction completed successfully.");
                }
            }
            latestBlock = latestBlock + 1;
        });
    }

    async onSubmit() {
        let formModel = this.pubKeyForm.value;
        console.log('===== Compute clicked =====');
        //TODO remove
        // console.log('User Public key file received: ', this.uploadedUserPubKeyFile);

        console.log('User Public key file IPFS Hash: ',formModel['pubKeyIpfs']);
        console.log('Selected dataset received: ', this.dataset);
        console.log('Selected container received: ', this.container);
        console.log('Selected software received: ', this.software);
        console.log('===========================');

        // let userPubKey = await this.readFile(this.uploadedUserPubKeyFile);
        // console.log(userPubKey);

        this.setTxStatus('Placing order...');
        let success = await this.orderService.addComputation(
            formModel['pubKeyIpfs'],
            this.container,
            this.dataset,
            this.software)
            .then(result => {
                if (!result) {
                    this.setTxStatus('Transaction failed!');
                    this.loggerService.add('Computation failed.');
                } else {
                    console.log(result);
                    this.setTxStatus('Transaction sent! Waiting for result...');
                }
            });
    }

    //Original
    // readFile(file: File) {
    //     let read = new FileReader();
    //     read.readAsBinaryString(file);
    //     return new Promise(resolve => {
    //         read.onloadend = function () {
    //             resolve(read.result);
    //         };
    //     });
    // }

    // saveToIpfs(pubKeyIpfs) {
    //     let ipfsId;
    //     const buffer = Buffer.from(pubKeyIpfs);
    //     this.ipfsApi.files.add(buffer, (err, files) => {
    //         console.log(files);
    //     });
        // }).then((response) => {
        //         console.log(response);
        //         ipfsId = response[0].hash;
        //         console.log("!!!!!!!!!!!!!!!!!!!!! ", ipfsId);
        //     }).catch((err) => {
        //     console.error(err)
        // })
    // };

    cancel() {
        if (this.softwareDisplayComponent) {
            this.softwareDisplayComponent.clear();
            this.software = null;
        }

        if (this.containerDisplayComponent) {
            this.containerDisplayComponent.clear();
            this.container = null;
        }

        if (this.datasetDisplayComponent) {
            this.datasetDisplayComponent.clear();
            this.dataset = null;
        }

        this.pubKeyForm.reset();
        //TODO remove
        // if (this.pubKeyUploadDisplayComponent) {
        //     this.pubKeyUploadDisplayComponent.removeFile();
        //     this.uploadedUserPubKeyFile = null;
        // }

        this.setTxStatus('');
    }

    setTxStatus(status) {
        this.txStatus = status;
    }

    getTxStatus() {
        return this.txStatus;
    }

    refreshPage(): void {
        window.location.reload();
    }
}
