import { Injectable } from '@angular/core';
import {Web3Service} from '../util/web3.service';
import order from "../../../build/contracts/Order.json";
import software_registry from "../../../build/contracts/SoftwareRegistry.json";
import dataset_registry from "../../../build/contracts/DatasetRegistry.json";
import container_registry from '../../../build/contracts/ContainerRegistry.json';
import Web3 from 'web3';
import {BcdbService} from './bcdb.service';

@Injectable()
export class OrderService {
    private currentAccount: string;
    private web3: Web3;
    private Order: any;
    private SoftwareRegistry: any;
    private DatasetRegistry: any;
    private ContainerRegistry: any;

  constructor(private web3Service: Web3Service,
              private bcdbService: BcdbService) {
      this.web3 = this.web3Service.getWeb3();

      web3Service.accountsObservable.subscribe(() => {
          this.web3.eth.getCoinbase().then(cb => {
              this.currentAccount = cb;
          });
      });
      this.web3Service
          .artifactsToContract(order)
          .then(SoftwareRepo => {
              this.Order = SoftwareRepo;
          });

      this.web3Service
          .artifactsToContract(software_registry)
          .then(SoftwareReg => {
              this.SoftwareRegistry = SoftwareReg;
          });

      this.web3Service
          .artifactsToContract(dataset_registry)
          .then(DatasetReg => {
              this.DatasetRegistry = DatasetReg;
          });

      this.web3Service
          .artifactsToContract(container_registry)
          .then(ContainerReg => {
              this.ContainerRegistry = ContainerReg;
          });
  }


  async placeNewOrder(container, dataset, software) {

      let swCostWei = await this.getSoftwareCost(software.ID);

      let dsCostWei = await this.getDatasetCost(dataset.ID);

      let containerCostWei = await this.getContainerCost(container.ID);

      let totalWei = +swCostWei + +dsCostWei + +containerCostWei;
      console.log(totalWei);

      let deployedOrder = await this.Order.deployed();
      try {
          let success = await deployedOrder.newOrder(
              container.ID,
              dataset.ID,
              software.ID,
              {from: this.currentAccount, value: totalWei});
          return success;
      } catch (e) {
          console.log(e);
      }
  }
    async getDatasetCost(datasetID) {

        let deployedDatasetRegistry = await this.DatasetRegistry.deployed();
        try {
            let dsInfo = await deployedDatasetRegistry.getDatasetByID.call(datasetID);

            let bcdbTxID = dsInfo [0];

            let bcdbDatasetAsset = await this.bcdbService.queryDB(bcdbTxID);

            return bcdbDatasetAsset .cost;
        } catch (e) {
            console.log(e);
            console.error(
                "Error loading dataset from blockchain."
            );
        }
    }

  async getSoftwareCost(softwareID) {

      let deployedSoftwareRegistry = await this.SoftwareRegistry.deployed();
      try {
          let swInfo = await deployedSoftwareRegistry.getSoftwareByID.call(softwareID);

          let bcdbTxID = swInfo[0];

          let bcdbSoftwareAsset = await this.bcdbService.queryDB(bcdbTxID);

          return bcdbSoftwareAsset.cost;
      } catch (e) {
          console.log(e);
          console.error(
              "Error loading software from blockchain."
          );
      }
  }

    async getContainerCost(containerID) {
        let deployedContainerRegistry = await this.ContainerRegistry.deployed();
        try {
            let containerInfo = await deployedContainerRegistry.getContainerByID.call(containerID);

            let bcdbTxID = containerInfo[0];

            let bcdbContainerAsset = await this.bcdbService.queryDB(bcdbTxID);

            return bcdbContainerAsset.cost;
        } catch (e) {
            console.log(e);
            console.error(
                "Error loading software from blockchain."
            );
        }
    }
}
