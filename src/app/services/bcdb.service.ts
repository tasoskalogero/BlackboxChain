import {Injectable} from '@angular/core';
import * as bcdb_driver from 'bigchaindb-driver';

@Injectable()
export class BcdbService {
    apiUrl = 'https://test.bigchaindb.com/api/v1/';
    conn;
    constructor() {
        this.conn = new bcdb_driver.Connection(this.apiUrl, {
            app_id: 'c2c9c771',
            app_key: '28b8fde912535489c425c2e266030b0e'
        });
    }

    async insertDataset(dsName,ipfsHash, randKeyIpfsHash, dsSpecs, cost) {
        const owner = new bcdb_driver.Ed25519Keypair();

        // let encodedDataset = btoa(datasetContent);
        console.log('[BCDB] Posting dataset' + ipfsHash + ' ' + randKeyIpfsHash + ' ' + dsName + ' ' + dsSpecs + ' ' + cost);

        let asset = {datasetName: dsName, ipfsHash: ipfsHash, dsRandomKeyipfsHash: randKeyIpfsHash, specification: dsSpecs, cost: cost};
        let metadata = null;

        const tx = bcdb_driver.Transaction.makeCreateTransaction(
            asset,
            metadata,
            [bcdb_driver.Transaction.makeOutput(bcdb_driver.Transaction.makeEd25519Condition(owner.publicKey))],
            owner.publicKey
        );
        const txSigned = bcdb_driver.Transaction.signTransaction(tx, owner.privateKey);

        // const conn = new bcdb_driver.Connection(this.apiUrl);

        let retrievedTx = await this.conn.postTransactionSync(txSigned);
        // let retrievedTx = await conn.pollStatusAndFetchTransaction(txSigned.id);
        console.log('[BCDB Dataset] - Transaction', retrievedTx.id, 'successfully posted.');
        return retrievedTx.id;
    }

    async insertSoftware(filename, ipfsHash, paramSpecs, specification, cost) {
        const owner = new bcdb_driver.Ed25519Keypair();
        console.log('[BCDB] Posting software: ' + filename + ' ' + ipfsHash + ' ' + paramSpecs + ' ' + specification + ' ' + cost);
        let asset = {
            filename: filename,
            ipfsHash: ipfsHash,
            paramSpecs: paramSpecs,
            specification: specification,
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

        let txSigned = await bcdb_driver.Transaction.signTransaction(tx, owner.privateKey);

        let retrievedTx = await this.conn.postTransactionSync(txSigned);
        console.log('[BCDB Software] - Transaction', retrievedTx.id, 'successfully posted.');
        return retrievedTx.id;
    }

    async insertContainer(containerDockerID, ipfsHash, publicKey, containerSpecs, cost) {
        const owner = new bcdb_driver.Ed25519Keypair();
        console.log("[BCDB] Posting container: " + containerDockerID + " " + publicKey + " " + containerSpecs + " " + cost);
        let asset = {
            containerDockerID: containerDockerID,
            ipfsHash: ipfsHash,
            pubKey: publicKey,
            specification: containerSpecs,
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

        let retrievedTx = await this.conn.postTransactionSync(txSigned);
        console.log("[BCDB Container] - Transaction", retrievedTx.id, "successfully posted.");
        return retrievedTx.id;
    }

    async query(bcdbTxId) {
        let assets = await this.conn.searchAssets(bcdbTxId);
        if(assets.length === 0) {
            return "BighcainDB TxId invalid";
        }
        console.log("[FOUND on BCDB]", assets);
        return assets[0].data;
    }

}
