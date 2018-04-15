import {Injectable} from '@angular/core';
import * as bcdb_driver from 'bigchaindb-driver';

@Injectable()
export class BcdbService {
    apiUrl = 'http://localhost:59984/api/v1/';

    //TODO make connection in constructor once?
    constructor() {
    }

    async createNewDataset(ipfsHash, dsName, dsDescr, cost) {
        const owner = new bcdb_driver.Ed25519Keypair();

        // let encodedDataset = btoa(datasetContent);
        console.log('[BCDB] Posting dataset' + ipfsHash + ' ' + dsName + ' ' + dsDescr + ' ' + cost);

        let asset = {datasetName: dsName, ipfsHash: ipfsHash, description: dsDescr, cost: cost};
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
        console.log('[BCDB Dataset] - Transaction', retrievedTx.id, 'successfully posted.');
        return retrievedTx.id;
    }

    async createNewSoftware(filename, ipfsHash, paramType, description, cost) {
        const owner = new bcdb_driver.Ed25519Keypair();
        console.log('[BCDB] Posting software: ' + filename + ' ' + ipfsHash + ' ' + paramType + ' ' + description + ' ' + cost);
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
        console.log('[BCDB Software] - Transaction', retrievedTx.id, 'successfully posted.');
        return retrievedTx.id;
    }

    async createNewContainer(containerDockerID, ipfsHash, publicKey, cost) {
        const owner = new bcdb_driver.Ed25519Keypair();
        console.log("[BCDB] Posting container: " + containerDockerID + " " + publicKey + " " + cost);
        let asset = {
            containerDockerID: containerDockerID,
            ipfsHash: ipfsHash,
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
        console.log("[BCDB Container] - Transaction", retrievedTx.id, "successfully posted.");
        return retrievedTx.id;
    }

    async queryDB(bcdbTxId) {
        const conn = new bcdb_driver.Connection(this.apiUrl);
        let assets = await conn.searchAssets(bcdbTxId);
        if(assets.length === 0) {
            return "BighcainDB TxId invalid";
        }
        console.log("[FOUND on BCDB]", assets);
        return assets[0].data;
    }

}
