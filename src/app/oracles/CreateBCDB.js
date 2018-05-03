const driver = require('bigchaindb-driver');

const alice = new driver.Ed25519Keypair();
let conn = new driver.Connection('https://test.bigchaindb.com/api/v1/', {
    app_id: 'c2c9c771',
    app_key: '28b8fde912535489c425c2e266030b0e'
});

const tx = driver.Transaction.makeCreateTransaction(
    { message: 'tttt' },
    null,
    [ driver.Transaction.makeOutput(
        driver.Transaction.makeEd25519Condition(alice.publicKey))],
    alice.publicKey);

const txSigned = driver.Transaction.signTransaction(tx, alice.privateKey)
conn.postTransactionSync(txSigned).then(tt => console.log(tt));