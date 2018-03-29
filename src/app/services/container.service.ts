import {Injectable} from '@angular/core';
import {Web3Service} from '../util/web3.service';
import container_repository from '../../../build/contracts/ContainerRepository.json';
import Web3 from 'web3';
import {Container} from '../models/models';
import {BdbService} from './bdb.service';

@Injectable()
export class ContainerService {
    private web3: Web3;
    private ContainerRepository: any;
    private currentAccount: string;

    constructor(private bdbService: BdbService,
                private web3Service: Web3Service) {

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

    async getContainersFromDB() {
        let fetchedContainers = [];
        let deployedContainerRepository = await this.ContainerRepository.deployed();
        try {
            let containerIDs = await deployedContainerRepository.getContainerIDs.call();
            console.log('ContainerIDs ' + containerIDs);

            for (let i = 0; i < containerIDs.length; ++i) {
                let containerInfo = await deployedContainerRepository.getContainerByID.call(containerIDs[i]);
                let id = containerInfo[0];
                let bdbId = containerInfo[1];

                let asset = await this.bdbService.queryDB(bdbId);
                let containerDockerID = asset.container_ID;
                let publicKey = asset.pubKey;
                let cost = this.web3.utils.fromWei(asset.cost, 'ether');
                let status = asset.status;

                let containerToAdd = new Container(id, containerDockerID, publicKey, status, cost);
                fetchedContainers.push(containerToAdd);
            }
            return fetchedContainers;
        } catch (e) {
            console.log(e);
            console.error('Error occured while getting number of containers');
        }
    }

    async addContainer(containerID: string, publicKey: File, cost: string, status: string) {
        let pubkeyContents = await this.readFile(publicKey);
        let txId = await this.bdbService.createNewContainer(containerID, pubkeyContents, cost, status);
        let deployedContainerRepository = await this.ContainerRepository.deployed();
        return await deployedContainerRepository.addNewContainer(txId, {from: this.currentAccount});
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

}
