import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Web3Service} from './util/web3.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  currentAccount: string;

  constructor(public router: Router,
              private web3Service: Web3Service,) {
  }

  ngOnInit(): void {
    let web3 = this.web3Service.getWeb3();
    this.web3Service.accountsObservable.subscribe(() => {
      web3.eth.getCoinbase().then(cb => {
        this.currentAccount = cb;
        console.log("Current account " + this.currentAccount);
      });
    });
  }
}
