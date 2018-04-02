import { Injectable } from "@angular/core";
import { Web3Service } from "../util/web3.service";
import software_repository from "../../../build/contracts/SoftwareRepository.json";
import Web3 from "web3";
import { Software } from "../models/models";
import { BdbService } from "./bdb.service";
import { LoggerService } from "./logger.service";

@Injectable()
export class SoftwareService {
  private currentAccount: string;
  private web3: Web3;
  private SoftwareRepository: any;

  constructor(
    private bdbService: BdbService,
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
      .artifactsToContract(software_repository)
      .then(SoftwareRepo => {
        this.SoftwareRepository = SoftwareRepo;
      });
  }

  async getSoftwareInfo() {
    let fetchedSoftware = [];

    let deployedSoftwareRepository = await this.SoftwareRepository.deployed();
    try {
      let swIDs = await deployedSoftwareRepository.getSoftwareIDs.call();
      console.log("SoftwareIDs " + swIDs);
      for (let i = 0; i < swIDs.length; ++i) {
        let swInfo = await deployedSoftwareRepository.getSoftwareByID.call(swIDs[i]);

        let swFilename = swInfo[0];
        let swIpfsHash = swInfo[1];
        let swParamTypes = swInfo[2];
        let swDescription = swInfo[3];
        let costEther = this.web3.utils.fromWei(swInfo[4].toNumber().toString(), 'ether');
        let owner = swInfo[5];

        let softwareToAdd = new Software(
            swIDs[i],
            swFilename,
            swIpfsHash,
            swParamTypes,
            swDescription,
            costEther,
            owner
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
    // let txId = await this.bdbService.createNewSoftware(
    //   _filename,
    //   _ipfsHash,
    //   _paramType,
    //   _description,
    //   _cost
    // );

    // this.loggerService.add("Software stored on BigchainDB - " + txId);
    let deployedSoftwareRepository = await this.SoftwareRepository.deployed();
    return await deployedSoftwareRepository.addNewSoftware(_filename, _ipfsHash,_paramType,_description, _cost, {
      from: this.currentAccount
    });
  }
}
