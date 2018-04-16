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
import orderContract from "../../../../../build/contracts/Order.json";


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

    @ViewChild(PubKeyUploadLayoutComponent)
    private pubKeyUploadDisplayComponent: PubKeyUploadLayoutComponent;

    @ViewChild(DatasetLayoutComponent)
    private datasetDisplayComponent: DatasetLayoutComponent;

    web3: Web3;
    container: Container;
    software: Software;
    uploadedUserPubKeyFile: File;
    dataset: Dataset;
    currentAccount: string;
    Order: any;
    private txStatus: string;

    constructor(
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

        communicationService.uploadedUserPubKey$.subscribe(file => {
            this.uploadedUserPubKeyFile = file;
        });

        this.web3 = this.web3Service.getWeb3();
        web3Service.accountsObservable.subscribe(() => {
            this.web3.eth.getCoinbase().then(cb => {
                this.currentAccount = cb;
            });
        });

        this.web3Service
            .artifactsToContract(orderContract)
            .then(order => {
                this.Order = order;
            });
        this.watchForResult();
    }


    ngOnInit() {
    }

    async watchForResult() {
        let latestBlock = await this.web3.eth.getBlockNumber();
        let deployedOrder = await this.Order.deployed();
        console.log('Watching for events');
        deployedOrder.OrderResult({fromBlock: latestBlock}, async (error, event) => {
            if (error) {
                console.log(error);
            } else {
                if (event.blockNumber !== latestBlock) {
                    console.log(event.args);
                    this.loggerService.add(event.args.result);
                    this.setTxStatus("Order completed successfully");
                }
            }
            latestBlock = latestBlock + 1;
        });
    }

    async onSubmit() {
        console.log('===== Compute clicked =====');
        console.log('User Public key file received: ', this.uploadedUserPubKeyFile);
        console.log('Selected dataset received: ', this.dataset);
        console.log('Selected container received: ', this.container);
        console.log('Selected software received: ', this.software);
        console.log('===========================');

        this.setTxStatus("Placing order...");
        let success = await this.orderService.placeNewOrder(
            this.container,
            this.dataset,
            this.software);

        // this.readFile(this.uploadedUserPubKeyFile).then(pubkey => {
        //     this.dockerCommunicationService
        //         .execCreate(this.container, this.software, this.dataset, pubkey)
        //         .subscribe(async res => {
        //             console.log('----------- ', res);
        //             if (res[0] == "FAILURE") {
        //                 //invalid bcdb transaction id of dataset OR cannot create exec instance
        //                 this.loggerService.add(res[1]);
        //             } else {
        //                 let exec_id = JSON.parse(res[1]).Id;
        //
        //                 let success = await this.orderService.placeNewOrder(
        //                     this.container,
        //                     this.dataset,
        //                     this.software
        //                 );
        //                 //TODO change
        //                 let paymentID = "";
        //                 this.dockerCommunicationService
        //                     .execStart(exec_id, paymentID)
        //                     .subscribe(res => {
        //                         let ipfsHash = res[1];
        //                         console.log(ipfsHash);
        //                         this.loggerService.add(res[0] + ' - ' + ipfsHash);
        //                     });
        //             }
        //         });
        // });
    }

    readFile(file: File) {
        let read = new FileReader();
        read.readAsBinaryString(file);
        return new Promise(resolve => {
            read.onloadend = function () {
                resolve(read.result);
            };
        });
    }

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

        if (this.pubKeyUploadDisplayComponent) {
            this.pubKeyUploadDisplayComponent.removeFile();
            this.uploadedUserPubKeyFile = null;
        }
        this.setTxStatus("");
    }

    setTxStatus(status) {
        this.txStatus = status;
    }

    getTxStatus() {
        return this.txStatus;
    }
}
