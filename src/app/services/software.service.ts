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
  private SoftwareReposigory: any;

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
        this.SoftwareReposigory = SoftwareRepo;
      });
  }

  async getSoftwareFromDB() {
    let fetchedSoftware = [];

    let deployedSoftwareRepository = await this.SoftwareReposigory.deployed();
    try {
      let swIDs = await deployedSoftwareRepository.getSoftwareIDs.call();
      console.log("SoftwareIDs " + swIDs);
      for (let i = 0; i < swIDs.length; ++i) {
        let swInfo = await deployedSoftwareRepository.getSoftwareByID.call(
          swIDs[i]
        );
        let id = swInfo[0];
        let bdbId = swInfo[1];

        let asset = await this.bdbService.queryDB(bdbId);

        let filename = asset.filename;
        let paramType = asset.paramType;
        let description = asset.description;
        let cost = this.web3.utils.fromWei(asset.cost, "ether");
        let softwareToAdd = new Software(
          id,
          filename,
          paramType,
          description,
          cost,
          bdbId
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

  async addSoftware(_filename, _ipfsHash, _paramType, _description, cost) {
    let txId = await this.bdbService.createNewSoftware(
      _filename,
      _ipfsHash,
      _paramType,
      _description,
      cost
    );

    this.loggerService.add("Software stored on BigchainDB - " + txId);
    let deployedSoftwareRepository = await this.SoftwareReposigory.deployed();
    return await deployedSoftwareRepository.addNewSoftware(txId, {
      from: this.currentAccount
    });
  }
}
