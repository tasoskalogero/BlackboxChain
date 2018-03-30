let express = require("express");
let app = express();
let http = require("http");
const bcdb_driver = require("bigchaindb-driver");
var Web3 = require("web3");

let bodyParser = require("body-parser");

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
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);

app.post("/exec/create", (request, res) => {
  let containerID = request.body.id;
  let softwareIPFSHash = request.body.swIPFS;
  let dataLoc = request.body.dataLoc;
  let userPubKey = request.body.pubUserKey;

  console.log(containerID);
  console.log(softwareIPFSHash);
  console.log(dataLoc);
  console.log(userPubKey);
  let commands = ["./wrapper.sh", dataLoc, softwareIPFSHash, userPubKey];
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
          console.log("DATA = ", rawData);
          resolve([status, rawData]);
        })
        .on("error", e => {
          console.log("ERROR", e);
        });
    });
    post_req.write(bodyCmd);
  }).then(([status, msg]) => {
    res.send([status, msg]);
  });
});

app.get("/exec/run", (request, res) => {
  let execID = request.query.execID;

  console.log("[ID]", execID, "/exec/" + execID + "/start");

  let bodyCmd = JSON.stringify({});
  let post_options = {
    socketPath: "/var/run/docker.sock",
    path: "/exec/" + execID + "/start",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(bodyCmd)
    },
    json: true
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
          console.log("RECEIVED: \n", rawData);
          resolve([status, rawData]);
        })
        .on("error", e => {
          console.log("ERROR", e);
        });
    });
    post_req.write(bodyCmd);
  }).then(([status, msg]) => {
    res.send([status, msg]);
  });
});

let server = app.listen(8081, () => {
  let host = server.address().address;
  let port = server.address().port;
    // let web3 = new Web3(Web3.givenProvider || "ws://localhost:9545");
    // web3.eth.defaultAccount = web3.eth.accounts[9];
    // web3.eth.getAccounts().then(e => console.log(e[9]));
    // console.log(web3.eth.getAccounts()[0]);
    console.log("Oracle server listening at http://%s:%s", host, port);
});
