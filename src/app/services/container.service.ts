import {Injectable} from '@angular/core';
import {Web3Service} from '../util/web3.service';
import container_registry from '../../../build/contracts/ContainerRegistry.json';
import registry_manager from '../../../build/contracts/RegistryManager.json';
import Web3 from 'web3';
import {Container} from '../models/models';
import {LoggerService} from './logger.service';
import {Md5} from 'ts-md5';
import {BcdbService} from './bcdb.service';

@Injectable()
export class ContainerService {
    private web3: Web3;
    private ContainerRegistry: any;
    private RegistryManager: any;
    private currentAccount: string;

    constructor(private bcdbService: BcdbService,
                private loggerService: LoggerService,
                private web3Service: Web3Service) {

        this.web3 = this.web3Service.getWeb3();

        web3Service.accountsObservable.subscribe(() => {
            this.web3.eth.getCoinbase().then(cb => {
                this.currentAccount = cb;
            });
        });

        this.web3Service.artifactsToContract(container_registry)
            .then(ContainerRepo => {
                this.ContainerRegistry = ContainerRepo;
            });
        this.web3Service.artifactsToContract(registry_manager)
            .then(RegistryManager => {
                this.RegistryManager = RegistryManager;
            });
    }

    async getContainers() {
        let fetchedContainers = [];
        let deployedContainerRegistry = await this.ContainerRegistry.deployed();
        try {
            let containerIDs = await deployedContainerRegistry.getContainerIDs.call();
            console.log('ContainerIDs ' + containerIDs);

            for (let i = 0; i < containerIDs.length; ++i) {
                let containerInfo = await deployedContainerRegistry.getContainerByID.call(containerIDs[i]);

                let bcdbTxID = containerInfo[0];

                let bcdbContainerAsset = await this.bcdbService.query(bcdbTxID);

                let containerDockerID = bcdbContainerAsset.containerDockerID;
                let pubKey = bcdbContainerAsset.pubKey;
                let costEther = this.web3.utils.fromWei(bcdbContainerAsset.cost, 'ether');

                let containerToAdd = new Container(containerIDs[i], containerDockerID, pubKey, costEther);
                fetchedContainers.push(containerToAdd);
            }
            return fetchedContainers;
        } catch (e) {
            console.log(e);
            console.error('Error occured while getting number of containers');
        }
    }

    async addContainer(_containerDockerID, _ipfsHash, publicKey, _cost) {
        let pubkeyContents = await this.readFile(publicKey);

        let bcdbTxID = await this.bcdbService.insertContainer(_containerDockerID, _ipfsHash, pubkeyContents, _cost);

        let checksum = this.computeChecksum(_containerDockerID, _ipfsHash, publicKey, _cost);
        let deployedRegistryManager = await this.RegistryManager.deployed();
        return await deployedRegistryManager.addContainerInfo(bcdbTxID, checksum, _cost,{from: this.currentAccount});
    }

    computeChecksum(_containerDockerID, _ipfsHash, publicKey, _cost) {
        return Md5.hashStr(_containerDockerID+_ipfsHash + publicKey + _cost);
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
