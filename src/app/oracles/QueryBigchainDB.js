const driver = require("bigchaindb-driver");
const API_PATH = 'https://test.bigchaindb.com/api/v1/';
// const conn = new driver.Connection(API_PATH);
let conn = new driver.Connection('https://test.bigchaindb.com/api/v1/', {
    app_id: 'c2c9c771',
    app_key: '28b8fde912535489c425c2e266030b0e'
});


let txid = process.argv[2];

conn.searchAssets(txid)
    .then(assets => {
        if(assets.length === 0) console.log("Error");
        else console.log("Found assets:", assets[0])
    });

// conn.searchMetadata(txid)
//   .then(assets => console.log('Found metadata:', assets));

// conn.searchMetadata("\"Print hello\"")
//   .then(assets => console.log('Found metadata:', assets));



