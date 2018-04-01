const express = require("express");
const app = express();
const http = require("http");
const contract = require("truffle-contract");
const path = require('path');
const driver = require("bigchaindb-driver");
const API_PATH = "http://localhost:59984/api/v1/";
const conn = new driver.Connection(API_PATH);
const Web3 = require("web3");
const codes = require('./error_codes.js');
let bodyParser = require("body-parser");
const DatasetRepositoryJSON = require(path.join(__dirname, "../../../build/contracts/DatasetRepository.json"));

let web3;

// Add headers
app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true}));

app.post("/exec/create", async (request, res, next) => {
  let containerID = request.body.id;
  let swBdbId = request.body.swBdbId;
  let datasetBdbId = request.body.datasetBdbId;
  let userPubKey = request.body.pubUserKey;

  console.log(containerID);
  console.log(swBdbId);
  console.log(datasetBdbId);
  console.log(userPubKey);

  let swAssets = await conn.searchAssets(swBdbId);
  let datasetAssets = await conn.searchAssets(datasetBdbId);

  if (swAssets.length === 0 || datasetAssets.length === 0) {
      res.send([300, codes.getErrorMessage(300)]);
      return next();
  }

  let swIPFSHash = swAssets[0].data.ipfsHash;
  let datasetIPFSHash = datasetAssets[0].data.ipfsHash;

  let commands = ["./wrapper.sh", datasetIPFSHash, swIPFSHash, userPubKey];
  let bodyCmd = JSON.stringify({
    Cmd: commands,
    AttachStdout: true
  });

  let path = "/containers/" + containerID + "/exec";
  let post_options = {
    socketPath: "/var/run/docker.sock",
    path: path,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(bodyCmd)
    }
  };
  new Promise(resolve => {
    let post_req = http.request(post_options, function(res) {
      res.setEncoding("utf8");
      let status = res.statusCode;
      console.log("STATUS: " + status);

      let rawData = "";
      res
        .on("data", function(chunk) {
          rawData += chunk;
          console.log("Response: " + chunk);
        })
        .on("end", () => {
          console.log("RESULT = ", rawData);
          resolve([status, rawData]);
        })
        .on("error", e => {
          console.log("ERROR", e);
          resolve(1,"Failed to create exec command.")
        });
    });
    post_req.write(bodyCmd);
  }).then(([status, msg]) => {
    res.send([status, msg]);
  });
});

app.post("/exec/run", (request, res) => {
  let execID = request.body.execId;

  console.log("[Exec ID]", execID);

  let bodyCmd = JSON.stringify({});
  let post_options = {
    socketPath: "/var/run/docker.sock",
    path: "/exec/" + execID + "/start",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(bodyCmd)
    }
  };

  new Promise(resolve => {
    let post_req = http.request(post_options, function(res) {
        // res.setEncoding("utf8");
        let status = res.statusCode;
        console.log("STATUS: " + status);

        let output = '';

        res.on('data', function(chunk) {
            console.log("Response:" + chunk);
            output += chunk;
        });

        res.on('end', () => {
          console.log("RESULT:", output);
          resolve(output);
        });

        res.on('error', e => {
          console.log("ERROR", e);
          resolve(1,"Failed to run exec command.")
        });
    });
    post_req.write(bodyCmd);
    post_req.end();

  }).then((msg) => {
      msg = msg.replace(/[\u0001\u0000\u0000\u0000\u0000\u0000\u0000\u0004]/g,'');
      msg = msg.trim();
      let error_codes_array = [600,610,620,630,640,650];
      if(error_codes_array.includes(parseInt(msg))) {
          let error_msg = codes.getErrorMessage(parseInt(msg));
          res.send(["Failure",error_msg]);
      } else {
        msg = msg.replace(/\//g, "");           // remove / from ipfs address result
          res.send(["Success",msg]);
      }

  });
});



async function triggerPayment() {
    let DatasetRepositoryContract = initContract(DatasetRepositoryJSON);
    DatasetRepositoryContract.deployed().then(instance => {
        return instance.getDatasetIDs.call({from: web3.eth.accounts[9]})
    }).then(res => {
        console.log(res);
    });
}


function initWeb3() {
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        // set the provider you want from Web3.providers
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
    }
}

function initContract(artifact) {
    let MyContract = contract(artifact);
    MyContract.setProvider(web3.currentProvider);

    //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
    if (typeof MyContract.currentProvider.sendAsync !== "function") {
        MyContract.currentProvider.sendAsync = function() {
            return MyContract.currentProvider.send.apply(
                MyContract.currentProvider,
                arguments);
        };
    }
    return MyContract;
}

initWeb3();


let server = app.listen(8081, () => {
  let host = server.address().address;
  let port = server.address().port;
  console.log("Oracle server listening at http://%s:%s", host, port);
});
