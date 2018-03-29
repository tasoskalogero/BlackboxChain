let express = require('express');
let app = express();
let http = require('http');
const bcdb_driver = require('bigchaindb-driver');

let bodyParser = require('body-parser');

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// app.post('/bcdb/transaction/create/data', async (request,res) => {
//   let ipfsAddr = request.body.ipfsAddr;
//   let dsName = request.body.dsName;
//   let dsDescr = request.body.dsDescr;
//   let cost = request.body.cost;
//
//   console.log("-------------");
//   console.log(ipfsAddr);
//   console.log(dsName);
//   console.log(dsDescr);
//   console.log(cost);
//   console.log("-------------");
//
//   const API_PATH = 'http://localhost:59984/api/v1/';
//
//   // //TODO how to sign transaction??
//   const owner = new bcdb_driver.Ed25519Keypair();
//
//   let asset = {datasetIPFSAddress: ipfsAddr};
//   let metadata = {datasetName: dsName, datasetDescription: dsDescr, datasetCost: cost};
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
//   console.log('Transaction', retrievedTx.id, 'successfully posted.');
//   res.send({txID: retrievedTx.id});
// });

app.post('/exec/create', (request,res) => {
  let containerID = request.body.id;
  let softwareIPFSHash = request.body.swIPFS;
  let dataLoc = request.body.dataLoc;
  let userPubKey = request.body.pubUserKey;

  console.log(containerID);
  console.log(softwareIPFSHash);
  console.log(dataLoc);
  console.log(userPubKey);
  let commands = ["./wrapper.sh",dataLoc, softwareIPFSHash, userPubKey];
  let bodyCmd = JSON.stringify(
    {
      "Cmd": commands,
      "AttachStdout":true
    });

  let path = '/containers/'+containerID+'/exec';
  let post_options = {
    socketPath: '/var/run/docker.sock',
    path:   path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyCmd)
    }
  };
  new Promise(resolve => {
    let post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      let status = res.statusCode;
      console.log('STATUS: ' + status);

      let rawData = '';
      res.on('data', function (chunk) {
        rawData += chunk;
        console.log('Response: ' + chunk);
      }).on('end',() => {
        console.log("DATA = ", rawData);
        resolve([status,rawData]);
      }).on('error', e => {
        console.log("ERROR", e);
      });
    });
    post_req.write(bodyCmd);
  }).then(([status,msg]) => {
    res.send([status,msg]);
  });
});


app.get('/exec/run', (request,res) => {
  let execID = request.query.execID;

  console.log("[ID]", execID, '/exec/'+execID+'/start');

  let bodyCmd = JSON.stringify({});
  let post_options = {
    socketPath: '/var/run/docker.sock',
    path:   '/exec/'+execID+'/start',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyCmd)
    },
    json: true
  };

  new Promise(resolve => {
    let post_req = http.request(post_options , function(res) {
      res.setEncoding('utf8');
      let status = res.statusCode;
      console.log('STATUS: ' + status);

      let rawData = '';
      res.on('data', function (chunk) {
        rawData += chunk;
        console.log('Response: ' + chunk);
      }).on('end',() => {
        console.log("RECEIVED: \n", rawData);
        resolve([status,rawData]);
      }).on('error', e => {
        console.log("ERROR", e);
      });
    });
    post_req.write(bodyCmd);
  }).then(([status,msg]) => {
    res.send([status,msg]);
  });
});

let server = app.listen(8081, () => {

    let host = server.address().address;
    let port = server.address().port;

    console.log("Server listening at http://%s:%s", host, port)

});
