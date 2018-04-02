import { Injectable } from '@angular/core';
import {Web3Service} from '../util/web3.service';
import payment from "../../../build/contracts/Payment.json";
import Web3 from 'web3';

@Injectable()
export class PaymentService {
    private currentAccount: string;
    private web3: Web3;
    private Payment: any;

  constructor(private web3Service: Web3Service) {
      this.web3 = this.web3Service.getWeb3();

      web3Service.accountsObservable.subscribe(() => {
          this.web3.eth.getCoinbase().then(cb => {
              this.currentAccount = cb;
          });
      });
      this.web3Service
          .artifactsToContract(payment)
          .then(SoftwareRepo => {
              this.Payment = SoftwareRepo;
          });
  }


  async createPayment(container, dataset, software) {
      let deployedPayment = await this.Payment.deployed();
      try {
          let totalAmountEther = +container.cost + +dataset.cost + +software.cost;
          let totalAmountWei = this.web3.utils.toWei(totalAmountEther.toString(), 'ether');
          let containerCost = this.web3.utils.toWei(container.cost.toString(), 'ether');
          let datasetCost = this.web3.utils.toWei(dataset.cost.toString(), 'ether');
          let softwareCost = this.web3.utils.toWei(software.cost.toString(), 'ether');

          let paymentID = this.web3.utils.sha3(container.ID, dataset.ID, software.ID, Date.now().toString());
          let success = await deployedPayment.createNewPayment(
              paymentID,
              container.ID, containerCost, container.owner,
              dataset.ID, datasetCost, dataset.owner,
              software.ID, softwareCost , software.owner,
              {from: this.currentAccount, value: totalAmountWei});
          return paymentID;
      } catch (e) {
          console.log(e);
      }
  }

}
