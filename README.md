# BlackboxChain

A system of smart contracts that orchestrate the data and software acquisition, enforce the execution of the software over the given data into a blockchain-unrelated component and make the computation output available to the recipient.

The project was implemented as part of my Master’s Thesis in Informatics at the Technical University of Munich (TUM). 

More information [here](https://github.com/tasoskalogero/tum-thesis-report).

## Prerequisites:

[Angular CLI](https://cli.angular.io/)

[NodeJS](https://nodejs.org/en/)

[Truffle](http://truffleframework.com/)

[Metamask](https://metamask.io/)

[IPFS](https://ipfs.io/)

[Docker](https://www.docker.com/)

### Start the Ethereum blockchain test network
* `truffle dev`

### Compile and migrate the contracts
* `compile && migrate`

### Run the dapp using the Angular CLI:
* First run  `npm install`
* Then run `ng serve --open`
* Navigate to `src/app/oracles` and run `node ValidationOracle.jsx` to start the oracle service

### BigchainDB Testnet Credentials
* api_url: https://test.bigchaindb.com/api/v1/
* app_id: `c2c9c771`
* app_key: `28b8fde912535489c425c2e266030b0e`

### Configure Metamask to connect to Truffle Blockchain network
* Custom RPC: http://localhost:9545 
* Copy the mnemonic phrase from Truffle to metamask

### Workflow


#### As a Container provider

1) Start a container

2) Attach to the running container and run the `generateKeys.sh` script

3) Exit from the container and copy the generated public key in the host machine locally

4) Add the container's filesystem on IPFS

5) Using the BlackboxChain dapp store the necessary information on the blockchain/BigchainDB

**Required:**

* Docker container ID

* IPFS address of container's filesystem

* Container's public key

* Container's specification

* Usage cost (in Ether)


#### As a Software provider

1) Add software on IPFS

2) Using the BlackboxChain dapp store the necessary information on the blockchain/BigchainDB

**Required:**

* Software filename

* IPFS address of software

* Input parameter specification

* Software specification

* Usage cost (in Ether)
   
#### As a Dataset provider

1) Run `randomKeyGen.sh` (helper_scripts) to generate a one-time password

2) Run `generateKeys.sh` (helper_scripts) to generate a private/public key pair

3) Run `encryptLargeFile.sh` (helper_scripts) to encrypt the dataset with the one-time password

4) Download a container's public key using the BlackboxChain dapp and run `encryptRandomKey.sh` (helper_scripts) to 
encrypt the one-time password with the container's public key

5) Add the two encrypted files on IPFS

6) Using the BlackboxChain dapp store the necessary information on the blockchain/BigchainDB

**Required:**

* Name of the dataset

* IPFS address of the enrcypted dataset

* IPFS address of the encrypted one-time password

* Dataset specification

* Usage cost (in Ether)

#### I want to..

##### Perform a Computation
From the menu on top, click `Computation` and then:

1) Upload your public key

2) Select a software

3) Select a dataset

4) Select a container that will perform the computation

Click `Run` in order to start the computation

##### Get the result
The result is encrypted with a one-time password, and the password is encrypted with the user's public key.

To get the computation output, from the top menu, click `Results` and then:

1) Run `getResult.sh` (helper_scripts) and give the displayed IPFS addresses

2) The result is available in the `result.bin` file
