const bcdb_driver = require('bigchaindb-driver');

const API_PATH = 'http://localhost:59984/api/v1/';

module.exports.postDataset = async function(datasetContent, dsName, dsDescr, cost) {
  //TODO use owner's public key
  const owner = new bcdb_driver.Ed25519Keypair();
  // let encodedDataset = encodeURIComponent(datasetContent);
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

  const conn = new bcdb_driver.Connection(API_PATH);
  await conn.postTransaction(txSigned);
  let retrievedTx = await conn.pollStatusAndFetchTransaction(txSigned.id);
  console.log('[Dataset] - Transaction', retrievedTx.id, 'successfully posted.');
  return retrievedTx.id;

};
//
//
// async function storeSoftware(ipfsAddr, filename, paramDescr, descr, cost) {
//
//   //TODO use owner's public key
//   const owner = new bcdb_driver.Ed25519Keypair();
//
//   let asset = {ipfs_ddress: ipfsAddr, type: "software"};
//   let metadata = {name: filename, parameters: paramDescr, description: descr, cost: cost};
//
//   const tx = bcdb_driver.Transaction.makeCreateTransaction(
//     asset,
//     metadata,
//     [bcdb_driver.Transaction.makeOutput(bcdb_driver.Transaction.makeEd25519Condition(owner.publicKey))],
//     owner.publicKey
//   );
//   const txSigned = bcdb_driver.Transaction.signTransaction(tx, owner.privateKey);
//   const conn = new bcdb_driver.Connection(API_PATH);
//   await conn.postTransaction(txSigned);
//   let retrievedTx = await conn.pollStatusAndFetchTransaction(txSigned.id);
//   console.log('[Software] - Transaction', retrievedTx.id, 'successfully posted.');
//   return retrievedTx.id;
//
// }
//
// async function storeContainer(ipfsAddr, id, pubKey, status, cost) {
//
//   //TODO use owner's public key
//   const owner = new bcdb_driver.Ed25519Keypair();
//
//   let asset = {ipfs_ddress: ipfsAddr, type: "container"};
//   let metadata = {container_id: id, public_key: pubKey, status: status, cost: cost};
//
//   const tx = bcdb_driver.Transaction.makeCreateTransaction(
//     asset,
//     metadata,
//     [bcdb_driver.Transaction.makeOutput(bcdb_driver.Transaction.makeEd25519Condition(owner.publicKey))],
//     owner.publicKey
//   );
//   const txSigned = bcdb_driver.Transaction.signTransaction(tx, owner.privateKey);
//   const conn = new bcdb_driver.Connection(API_PATH);
//   await conn.postTransaction(txSigned);
//   let retrievedTx = await conn.pollStatusAndFetchTransaction(txSigned.id);
//   console.log('[Container] - Transaction', retrievedTx.id, 'successfully posted.');
//   return retrievedTx.id;
// }

// export {postDataset};
