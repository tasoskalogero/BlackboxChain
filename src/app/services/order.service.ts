import { Injectable } from '@angular/core';
import {Web3Service} from '../util/web3.service';
import computation from "../../../build/contracts/Order.json";
import software_registry from "../../../build/contracts/SoftwareRegistry.json";
import dataset_registry from "../../../build/contracts/DatasetRegistry.json";
import container_registry from '../../../build/contracts/ContainerRegistry.json';
import Web3 from 'web3';
import {BdbService} from './bdb.service';

@Injectable()
export class OrderService {
    private currentAccount: string;
    private web3: Web3;
    private Computation: any;
    private SoftwareRegistry: any;
    private DatasetRegistry: any;
    private ContainerRegistry: any;

  constructor(private web3Service: Web3Service,
              private bdbService: BdbService) {
      this.web3 = this.web3Service.getWeb3();

      web3Service.accountsObservable.subscribe(() => {
          this.web3.eth.getCoinbase().then(cb => {
              this.currentAccount = cb;
          });
      });
      this.web3Service
          .artifactsToContract(computation)
          .then(SoftwareRepo => {
              this.Computation = SoftwareRepo;
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

      let deployedComputation = await this.Computation.deployed();
      try {
          let success = await deployedComputation.newOrder(
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

            let bcdbID = dsInfo [0];

            let bcdbDatasetAsset = await this.bdbService.queryDB(bcdbID);

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

          let bcdbID = swInfo[0];

          let bcdbSoftwareAsset = await this.bdbService.queryDB(bcdbID);

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

            let bcdbID = containerInfo[0];

            let bcdbContainerAsset = await this.bdbService.queryDB(bcdbID);

            return bcdbContainerAsset.cost;
        } catch (e) {
            console.log(e);
            console.error(
                "Error loading software from blockchain."
            );
        }
    }
}
