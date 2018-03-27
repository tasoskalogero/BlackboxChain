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
import payment from '../../../../../build/contracts/Payment.json';
import dataset_repository from '../../../../../build/contracts/DatasetRepository.json';
import container_repository from '../../../../../build/contracts/ContainerRepository.json';


@Component({
  selector: 'app-computation-layout',
  templateUrl: './computation-layout.component.html',
  styleUrls: ['./computation-layout.component.css'],
  providers:[CommunicationService]
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


  container: Container;
  software: Software;
  uploadedUserPubKeyFile: File;
  dataset: Dataset;

  constructor(
      private web3Service: Web3Service,
      private communicationService: CommunicationService,
      private dockerCommunicationService: DockerCommunicationService,
      private loggerService: LoggerService) {

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
  }

  ngOnInit() {

  }

  async onSubmit() {
    console.log('===== Compute clicked =====');
    console.log("User Public key file received: ", this.uploadedUserPubKeyFile);
    console.log("Selected dataset received: ", this.dataset);
    console.log("Selected container received: ", this.container);
    console.log("Selected software received: ", this.software);
    console.log('===========================');

    // let tempContainerID = '56c7a068d4b9';
    // let tempSoftwareAddress = 'QmX8CUR8sWMh2Kh4km2AzVTJTYewz7f9ugKuApmYskd57L';
    // let tempDatasetBCDB = '1771d576ba934c255e535f4c1c0f2bdfaaec86373f5c702b7570531e4ae54629';

    this.readFile(this.uploadedUserPubKeyFile)
      .then(pubkey => {
        this.dockerCommunicationService.execCreate(this.container.dockerID, this.software.ipfsAddress, this.dataset.bcdbTxID, pubkey)
          // this.dockerCommunicationService.execCreate(tempContainerID, tempSoftwareAddress, tempDatasetBCDB, pubkey)
          .subscribe( res => {
            console.log("----------- ",res);
            let exec_id = JSON.parse(res[1]).Id;
            this.dockerCommunicationService.execStart(exec_id)
              .subscribe( res => {
                let ipfsAddr = res[1].replace(/\//g, '');
                console.log(ipfsAddr);
                this.loggerService.add(ipfsAddr)

              });
          });
      });
  }


  readFile(file:File) {
    let read = new FileReader();
    read.readAsBinaryString(file);
    return new Promise(resolve => {
      read.onloadend = function() {
        resolve(read.result);
      };
    });
  }

  cancel() {
    if(this.softwareDisplayComponent) {
      this.softwareDisplayComponent.clear();
      this.software = null;
    }

    if(this.containerDisplayComponent) {
      this.containerDisplayComponent.clear();
      this.container = null;
    }

    if(this.datasetDisplayComponent) {
      this.datasetDisplayComponent.clear();
      this.dataset = null;
    }

    if(this.pubKeyUploadDisplayComponent) {
      this.pubKeyUploadDisplayComponent.removeFile();
      this.uploadedUserPubKeyFile = null;
    }
  }

    async execPayment() {
        let DatasetRepository = await this.web3Service.artifactsToContract(dataset_repository);
        let deployedDatasetRepository = await DatasetRepository.deployed();
        let DatasetRepoAddress = deployedDatasetRepository.address;

        let ContainerRepository = await this.web3Service.artifactsToContract(container_repository);
        let deployedContainerRepository = await ContainerRepository.deployed();
        let ContainerRepoAddress = deployedContainerRepository.address;

        let Payment = await this.web3Service.artifactsToContract(payment);
        let deployedPayment = await Payment.deployed();

        try{
          let web3 = this.web3Service.getWeb3();
          let currentAccount = await web3.eth.getCoinbase();
            let totalCostEth = (+this.dataset.cost + +this.container.cost).toString();
            let totalCostWei = web3.utils.toWei(totalCostEth, 'ether');
            console.log(totalCostWei);
            let cost = await deployedPayment.payment(
              DatasetRepoAddress,
              ContainerRepoAddress,
              this.dataset.ID,
              this.container.dockerID, {from: currentAccount, value: totalCostWei});
            console.log("PAYMENT:",cost);
        }catch(e) {
            console.log(e);
            console.error('Payment: Error executing money transfer.');
        }
    }
}
