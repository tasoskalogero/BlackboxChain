import { Injectable } from "@angular/core";
import { Web3Service } from "../util/web3.service";
import software_registry from "../../../build/contracts/SoftwareRegistry.json";
import registry_manager from "../../../build/contracts/RegistryManager.json";
import Web3 from "web3";
import { Software } from "../models/models";
import { BcdbService } from "./bcdb.service";
import { LoggerService } from "./logger.service";
import {Md5} from 'ts-md5/dist/md5';

@Injectable()
export class SoftwareService {
  private currentAccount: string;
  private web3: Web3;
  private RegistryManager: any;
  private SoftwareRegistry : any;

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
      .artifactsToContract(registry_manager)
      .then(RegistryManager => {
        this.RegistryManager = RegistryManager;
      });
    this.web3Service.artifactsToContract(software_registry)
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

        let bcdbSoftwareAsset = await this.bcdbService.query(bcdbTxID);

        let swFilename = bcdbSoftwareAsset.filename;
        let swParamSpecs = bcdbSoftwareAsset.paramSpecs;
        let swSPecification = bcdbSoftwareAsset.specification;
        let costEther = this.web3.utils.fromWei(bcdbSoftwareAsset.cost, 'ether');

        let softwareToAdd = new Software(
            softwareIDs[i],
            swFilename,
            swParamSpecs,
            swSPecification,
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

  async addSoftware(_filename, _ipfsHash, _paramSpecs, _specification, _cost) {
    let bcdbTxID = await this.bcdbService.insertSoftware(
      _filename,
      _ipfsHash,
      _paramSpecs,
      _specification,
      _cost
    );

    this.loggerService.add("Software stored on BigchainDB - " + bcdbTxID);
    let checksum = this.computeChecksum(_filename, _ipfsHash, _paramSpecs, _specification, _cost);

    let deployedRegistryManager = await this.RegistryManager.deployed();
    return await deployedRegistryManager.addSoftwareInfo(bcdbTxID, checksum, _cost, {from: this.currentAccount});
  }

  computeChecksum(_filename, _ipfsHash, _paramSpecs, _specification, _cost) {
    return Md5.hashStr(_filename +_ipfsHash+_paramSpecs+_specification+_cost);
  }
}
