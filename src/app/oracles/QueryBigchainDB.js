const driver = require("bigchaindb-driver");
const API_PATH = "http://localhost:59984/api/v1/";
const conn = new driver.Connection(API_PATH);

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


