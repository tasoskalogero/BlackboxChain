import { Injectable } from '@angular/core';
import {Web3Service} from '../util/web3.service';
import dataset_repository from '../../../build/contracts/DatasetRepository.json';
import Web3 from 'web3';
import {LoggerService} from './logger.service';
import {Dataset} from '../models/models';
import {BdbService} from './bdb.service';

@Injectable()
export class DatasetService {
  private web3: Web3;
  private DatasetRepository: any;
  private currentAccount: string;

  constructor(private web3Service: Web3Service,
              private bdbService: BdbService,
              private loggerService: LoggerService) {
    this.web3 = this.web3Service.getWeb3();
    web3Service.accountsObservable.subscribe(() => {
      this.web3.eth.getCoinbase().then(cb => {
        this.currentAccount = cb;
      });
    });


    this.web3Service.artifactsToContract(dataset_repository)
      .then(DatasetRepo => {
        this.DatasetRepository = DatasetRepo;
      })
  }

  async getDatasetFromDB() {
    let datasets = [];
    let deployedDatasetRepository = await this.DatasetRepository.deployed();
    try {
      let datasetIDs = await deployedDatasetRepository.getDatasetIDs.call();
      console.log("DatasetIDs " + datasetIDs);

      for(let i = 0; i < datasetIDs.length; ++i) {
        let datasetInfo = await deployedDatasetRepository.getDatasetByID.call(datasetIDs[i]);
        let id = datasetInfo[0];
        let bdbId = datasetInfo[1];

        let asset = await this.bdbService.queryDB(bdbId);

        let datasetName = asset.name;
        let datasetDescription = asset.description;
        let cost = this.web3.utils.fromWei(asset.cost, 'ether');

        let datasetToAdd = new Dataset(id, datasetName, datasetDescription, cost, bdbId);
        datasets.push(datasetToAdd);
      }
    } catch(e) {
      console.log(e);
      console.error('Error occured whild getting number of data');
    }
    return datasets;
  }

  async addDataset(datasetFile: File, dsName: string, dsDescription: string, cost: string) {
    let encryptedDatasetContents = await this.readFile(datasetFile);
    let txId = await this.bdbService.createNewDataset(encryptedDatasetContents, dsName, dsDescription, cost);
    this.loggerService.add('Dataset stored on BigchainDB - ' + txId );

    let deployedDatasetRepository = await this.DatasetRepository.deployed();

    return await deployedDatasetRepository.addNewDataset(txId, {from: this.currentAccount});
  }

  readFile(dataFile) {
    return this.readContents(dataFile);
  }

  private readContents(data) {
    let reader = new FileReader();

    return new Promise((resolve, reject) => {

      reader.onload = function(event) {
        let contents = reader.result;
        resolve(contents);
      };

      reader.readAsBinaryString(data);
    })
  }
}

