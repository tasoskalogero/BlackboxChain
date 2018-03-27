import {Injectable} from '@angular/core';
import {Web3Service} from '../util/web3.service';
import software_repository from '../../../build/contracts/SoftwareRepository.json';
import Web3 from 'web3';
import {Software} from '../models/models';

@Injectable()
export class SoftwareService  {

  private currentAccount: string;
  private web3: Web3;
  private SoftwareReposigory: any;

  constructor(private web3Service: Web3Service) {
    this.web3 = this.web3Service.getWeb3();

    web3Service.accountsObservable.subscribe(() => {
      this.web3.eth.getCoinbase().then(cb => {
        this.currentAccount = cb;
      });
    });


    this.web3Service.artifactsToContract(software_repository)
      .then(SoftwareRepo => {
        this.SoftwareReposigory = SoftwareRepo;
      });
  }

  async getSoftware()  {
    let fetchedSoftware = [];

    let deployedSoftwareRepository = await this.SoftwareReposigory.deployed();
    try{

      let swIDs = await deployedSoftwareRepository.getSoftwareIDs.call();
      console.log("SoftwareIDs " + swIDs);
      for(let i = 0; i < swIDs.length; ++i) {
        let receivedSW = await deployedSoftwareRepository.getSoftwareByID.call(swIDs[i]);

        let filename = receivedSW[0];
        let ipfsAddress = receivedSW[1];
        let paramType = receivedSW[2];
        let description = receivedSW[3];

        let softwareToAdd = new Software(swIDs[i],filename, ipfsAddress, paramType, description);

        fetchedSoftware.push(softwareToAdd);
      }
    }catch(e) {
      console.log(e);
      console.error('Software service: Error loading software from blockchain network.');
    }
    return fetchedSoftware;
  }

  async addSoftware(_filename, _ipfsAddress, _paramType, _description) {
    console.log('Adding', _filename, _ipfsAddress, _paramType, _description);
    let deployedSoftwareRepository = await this.SoftwareReposigory.deployed();
    return await deployedSoftwareRepository.addSoftware(
      _filename,
      _ipfsAddress,
      _paramType,
      _description, {from: this.currentAccount});
  }

}
