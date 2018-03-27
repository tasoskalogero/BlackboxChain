import { Injectable } from '@angular/core';
import {Web3Service} from '../util/web3.service';
import container_repository from '../../../build/contracts/ContainerRepository.json';
import Web3 from 'web3';
import {Container} from '../models/models';

@Injectable()
export class ContainerService {
  private web3: Web3;
  private ContainerRepository: any;
  private currentAccount: string;

  constructor(private web3Service: Web3Service) {

    this.web3 = this.web3Service.getWeb3();

    web3Service.accountsObservable.subscribe(() => {
      this.web3.eth.getCoinbase().then(cb => {
        this.currentAccount = cb;
      });
    });

    this.web3Service.artifactsToContract(container_repository)
      .then(async ContainerRepo => {
        this.ContainerRepository = ContainerRepo;
      });
  }

  async getContainers() {
    let fetchedContainers = [];
    let deployedContainerRepository = await this.ContainerRepository.deployed();
    try {
      let containerIDs = await deployedContainerRepository.getContainerIDs.call();
      console.log("ContainerIDs " + containerIDs);

      for (let i = 0; i < containerIDs.length; ++i) {
        let container = await deployedContainerRepository.getContainerByID.call(containerIDs[i]);
        let containerDocID = this.web3.utils.toAscii(container[0]);
        let publicKey = container[1];
        let cost = this.web3.utils.fromWei(container[2].toNumber().toString(), 'ether');
        let status = container[3];

        let containerToAdd = new Container(containerIDs[i],containerDocID, publicKey, status, cost);
        fetchedContainers.push(containerToAdd);
      }
      return fetchedContainers;
    }catch(e){
      console.log(e);
      console.error("Error occured while getting number of containers");
    }
  }

  async addContainer(containerID: string, publicKey: File, cost: string, status: string) {
    let pubkeyContents = await this.readFile(publicKey);
      let deployedContainerRepository = await this.ContainerRepository.deployed();
      return await deployedContainerRepository.addNewContainer(containerID, pubkeyContents, cost, status, {from: this.currentAccount});
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

}
