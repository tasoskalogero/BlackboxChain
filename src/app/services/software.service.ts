import { Injectable } from "@angular/core";
import { Web3Service } from "../util/web3.service";
import software_registry from "../../../build/contracts/SoftwareRegistry.json";
import Web3 from "web3";
import { Software } from "../models/models";
import { BcdbService } from "./bcdb.service";
import { LoggerService } from "./logger.service";
import {Md5} from 'ts-md5/dist/md5';

@Injectable()
export class SoftwareService {
  private currentAccount: string;
  private web3: Web3;
  private SoftwareRegistry: any;

  constructor(
    private bcdbService: BcdbService,
    private loggerService: LoggerService,
    private web3Service: Web3Service
  ) {
    this.web3 = this.web3Service.getWeb3();

    web3Service.accountsObservable.subscribe(() => {
      this.web3.eth.getCoinbase().then(cb => {
        this.currentAccount = cb;
      });
    });

    this.web3Service
      .artifactsToContract(software_registry)
      .then(SoftwareReg => {
        this.SoftwareRegistry = SoftwareReg;
      });
  }

  async getSoftwareInfo() {
    let fetchedSoftware = [];

    let deployedSoftwareRegistry = await this.SoftwareRegistry.deployed();
    try {
      let softwareIDs = await deployedSoftwareRegistry.getSoftwareIDs.call();
      console.log("SoftwareIDs " + softwareIDs);
      for (let i = 0; i < softwareIDs.length; ++i) {
        let swInfo = await deployedSoftwareRegistry.getSoftwareByID.call(softwareIDs[i]);

        let bcdbTxID = swInfo[0];

        let bcdbSoftwareAsset = await this.bcdbService.queryDB(bcdbTxID);

        let swFilename = bcdbSoftwareAsset.filename;
        let swParamTypes = bcdbSoftwareAsset.paramType;
        let swDescription = bcdbSoftwareAsset.description;
        let costEther = this.web3.utils.fromWei(bcdbSoftwareAsset.cost, 'ether');

        let softwareToAdd = new Software(
            softwareIDs[i],
            swFilename,
            swParamTypes,
            swDescription,
            costEther
        );

        fetchedSoftware.push(softwareToAdd);
      }
    } catch (e) {
      console.log(e);
      console.error(
        "Software service: Error loading software from blockchain network."
      );
    }
    return fetchedSoftware;
  }

  async addSoftware(_filename, _ipfsHash, _paramType, _description, _cost) {
    let bcdbTxID = await this.bcdbService.createNewSoftware(
      _filename,
      _ipfsHash,
      _paramType,
      _description,
      _cost
    );

    this.loggerService.add("Software stored on BigchainDB - " + bcdbTxID);
    let checksum = this.checksumCalculator(_filename, _ipfsHash, _paramType, _description, _cost);

    let deployedSoftwareRegistry = await this.SoftwareRegistry.deployed();
    return await deployedSoftwareRegistry.addNewSoftware(bcdbTxID, checksum, _cost, {from: this.currentAccount});
  }

  checksumCalculator(_filename, _ipfsHash, _paramType, _description, _cost) {
    return Md5.hashStr(_filename +_ipfsHash+_paramType+_description+_cost);
  }
}
