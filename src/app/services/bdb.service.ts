import { Injectable } from "@angular/core";
import * as bcdb_driver from "bigchaindb-driver";

@Injectable()
export class BdbService {
  apiUrl = "http://localhost:59984/api/v1/";

  //TODO make connection in constructor once?
  constructor() {}

  async createNewDataset(ipfsHash, dsName, dsDescr, cost) {
    const owner = new bcdb_driver.Ed25519Keypair();

    // let encodedDataset = btoa(ipfsHash);
    console.log(
      "Posting dataset: " + ipfsHash + " " + dsName + " " + dsDescr + " " + cost
    );

    let asset = {
      ipfsHash: ipfsHash,
      name: dsName,
      description: dsDescr,
      cost: cost
    };
    let metadata = null;

    const tx = bcdb_driver.Transaction.makeCreateTransaction(
      asset,
      metadata,
      [
        bcdb_driver.Transaction.makeOutput(
          bcdb_driver.Transaction.makeEd25519Condition(owner.publicKey)
        )
      ],
      owner.publicKey
    );
    const txSigned = bcdb_driver.Transaction.signTransaction(
      tx,
      owner.privateKey
    );

    const conn = new bcdb_driver.Connection(this.apiUrl);
    await conn.postTransaction(txSigned);
    let retrievedTx = await conn.pollStatusAndFetchTransaction(txSigned.id);
    console.log(
      "[Dataset] - Transaction",
      retrievedTx.id,
      "successfully posted."
    );
    return retrievedTx.id;
  }

  async createNewContainer(containerDockerID, publicKey, cost) {
    const owner = new bcdb_driver.Ed25519Keypair();
    console.log(
      "Posting container: " + containerDockerID + " " + publicKey + " " + cost
    );
    let asset = {
      container_ID: containerDockerID,
      pubKey: publicKey,
      cost: cost
    };
    let metadata = null;

    const tx = bcdb_driver.Transaction.makeCreateTransaction(
      asset,
      metadata,
      [
        bcdb_driver.Transaction.makeOutput(
          bcdb_driver.Transaction.makeEd25519Condition(owner.publicKey)
        )
      ],
      owner.publicKey
    );
    const txSigned = bcdb_driver.Transaction.signTransaction(
      tx,
      owner.privateKey
    );

    const conn = new bcdb_driver.Connection(this.apiUrl);
    await conn.postTransaction(txSigned);
    let retrievedTx = await conn.pollStatusAndFetchTransaction(txSigned.id);
    console.log(
      "[Container] - Transaction",
      retrievedTx.id,
      "successfully posted."
    );
    return retrievedTx.id;
  }

  async queryDB(bdbId) {
    const conn = new bcdb_driver.Connection(this.apiUrl);
    let assets = await conn.searchAssets(bdbId);
    console.log("[FOUND on BDB]", assets);
    return assets[0].data;
  }

  async createNewSoftware(
    filename: any,
    ipfsHash: any,
    paramType: any,
    description: any,
    cost: any
  ) {
    const owner = new bcdb_driver.Ed25519Keypair();
    console.log(
      "Posting software: " +
        filename +
        " " +
        ipfsHash +
        " " +
        paramType +
        "" +
        description +
        " " +
        cost
    );
    let asset = {
      filename: filename,
      ipfsHash: ipfsHash,
      paramType: paramType,
      description: description,
      cost: cost
    };
    let metadata = null;

    const tx = bcdb_driver.Transaction.makeCreateTransaction(
      asset,
      metadata,
      [
        bcdb_driver.Transaction.makeOutput(
          bcdb_driver.Transaction.makeEd25519Condition(owner.publicKey)
        )
      ],
      owner.publicKey
    );
    const txSigned = bcdb_driver.Transaction.signTransaction(
      tx,
      owner.privateKey
    );

    const conn = new bcdb_driver.Connection(this.apiUrl);
    await conn.postTransaction(txSigned);
    let retrievedTx = await conn.pollStatusAndFetchTransaction(txSigned.id);
    console.log(
      "[Software] - Transaction",
      retrievedTx.id,
      "successfully posted."
    );
    return retrievedTx.id;
  }
}
