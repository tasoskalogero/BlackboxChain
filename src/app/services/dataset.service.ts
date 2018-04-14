import { Injectable } from "@angular/core";
import { Web3Service } from "../util/web3.service";
import dataset_registry from "../../../build/contracts/DatasetRegistry.json";
import Web3 from "web3";
import { LoggerService } from "./logger.service";
import { Dataset } from "../models/models";
import { BdbService } from "./bdb.service";
import {Md5} from 'ts-md5';

@Injectable()
export class DatasetService {
  private web3: Web3;
  private DatasetRegistry: any;
  private currentAccount: string;

  constructor(
    private web3Service: Web3Service,
    private bdbService: BdbService,
    private loggerService: LoggerService
  ) {
    this.web3 = this.web3Service.getWeb3();
    web3Service.accountsObservable.subscribe(() => {
      this.web3.eth.getCoinbase().then(cb => {
        this.currentAccount = cb;
      });
    });

    this.web3Service
      .artifactsToContract(dataset_registry)
      .then(DatasetReg => {
        this.DatasetRegistry = DatasetReg;
      });
  }

  async getDatasets() {

      let fetchedDatasets = [];
      let deployedDatasetRegistry = await this.DatasetRegistry.deployed();
      try {
          let datasetIDs = await deployedDatasetRegistry.getDatasetIDs.call();
          console.log("DatasetIDs " + datasetIDs);

          for(let i = 0; i < datasetIDs.length; ++i) {
              let dsInfo = await deployedDatasetRegistry.getDatasetByID.call(datasetIDs[i]);

              let bcdbID = dsInfo[0];

              let bcdbDatasetAsset = await this.bdbService.queryDB(bcdbID);

              let datasetName = bcdbDatasetAsset.datasetName;
              let datasetDescription = bcdbDatasetAsset.description;
              let costEther = this.web3.utils.fromWei(bcdbDatasetAsset.cost, 'ether');

              let datasetToAdd = new Dataset(
                  datasetIDs[i],
                  datasetName,
                  datasetDescription,
                  costEther);
              fetchedDatasets.push(datasetToAdd);
          }
      } catch(e) {
          console.log(e);
          console.error('Error occured whild getting number of data');
      }
      return fetchedDatasets;

  }

  async addDataset(_dsName, _ipfsHash, _dsDescription, _cost) {
    // let encryptedDatasetContents = await this.readFile(datasetFile);
    let bcdbTxID = await this.bdbService.createNewDataset(_ipfsHash, _dsName, _dsDescription, _cost);

    this.loggerService.add("Dataset stored on BigchainDB - " + bcdbTxID);

      let checksum = this.checksumCalculator(_dsName, _ipfsHash, _dsDescription, _cost);
    let deployedDatasetRegistry = await this.DatasetRegistry.deployed();

    return await deployedDatasetRegistry.addNewDataset(bcdbTxID, checksum, {from: this.currentAccount});
  }


    checksumCalculator(_name, _ipfsHash, _description, _cost) {
        return Md5.hashStr(_name+_ipfsHash+_description+_cost);
    }

  // readFile(dataFile) {
  //   return this.readContents(dataFile);
  // }

  // private readContents(data) {
  //   let reader = new FileReader();
  //
  //   return new Promise((resolve, reject) => {
  //     reader.onload = function(event) {
  //       let contents = reader.result;
  //       resolve(contents);
  //     };
  //
  //     reader.readAsBinaryString(data);
  //   });
  // }
}
