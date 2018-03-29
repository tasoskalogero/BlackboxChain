import { Injectable } from '@angular/core';
import * as bcdb_driver from 'bigchaindb-driver'


@Injectable()
export class BdbService {
  apiUrl = 'http://localhost:59984/api/v1/';

  //TODO make connection in constructor once?
  constructor() { }

  async createNewDataset(datasetContent, dsName, dsDescr, cost) {
      const owner = new bcdb_driver.Ed25519Keypair();

      let encodedDataset = btoa(datasetContent);
      console.log('Posting ' + encodedDataset + ' ' + dsName + ' ' + dsDescr + ' ' + cost);

      let asset = {contents: encodedDataset, type: "dataset"};
      let metadata = {name: dsName, description: dsDescr, cost: cost};

      const tx = bcdb_driver.Transaction.makeCreateTransaction(
          asset,
          metadata,
          [bcdb_driver.Transaction.makeOutput(bcdb_driver.Transaction.makeEd25519Condition(owner.publicKey))],
          owner.publicKey
      );
      const txSigned = bcdb_driver.Transaction.signTransaction(tx, owner.privateKey);

      const conn = new bcdb_driver.Connection(this.apiUrl);
      await conn.postTransaction(txSigned);
      let retrievedTx = await conn.pollStatusAndFetchTransaction(txSigned.id);
      console.log('[Dataset] - Transaction', retrievedTx.id, 'successfully posted.');
      return retrievedTx.id;
  }

  async createNewContainer(containerDockerID, publicKey, cost, status) {
      const owner = new bcdb_driver.Ed25519Keypair();
      console.log('Posting container: ' + containerDockerID+ ' ' + publicKey+ ' ' + cost+ ' ' + status);
      let asset = {container_ID: containerDockerID, pubKey: publicKey, cost: cost, status: status};
      let metadata = null;

      const tx = bcdb_driver.Transaction.makeCreateTransaction(
          asset,
          metadata,
          [bcdb_driver.Transaction.makeOutput(bcdb_driver.Transaction.makeEd25519Condition(owner.publicKey))],
          owner.publicKey
      );
      const txSigned = bcdb_driver.Transaction.signTransaction(tx, owner.privateKey);

      const conn = new bcdb_driver.Connection(this.apiUrl);
      await conn.postTransaction(txSigned);
      let retrievedTx = await conn.pollStatusAndFetchTransaction(txSigned.id);
      console.log('[Dataset] - Transaction', retrievedTx.id, 'successfully posted.');
      return retrievedTx.id;
  }

  async getContainerAsset(bdbId) {
      const conn = new bcdb_driver.Connection(this.apiUrl);
      let assets = await conn.searchAssets(bdbId);
      console.log('[CONTAINER on BDB]',assets[0].data);
      return assets[0].data;
  }
}
