
# truffle-angular-app

#### Start the test network
* `truffle dev`

#### Compile and migrate the contracts
* `compile && migrate`

#### Run the app using Angular CLI:
* `ng serve --open`

#### Software provider

From the menu on top, click on the `Software` tab and enter the details. Then click `Save`
to make your software available.

Required:
* Filename
* IPFS address
* Input parameter description
* Software description
   
#### Data provider

From the menu on top, click on the `Datasets` tab and enter the details. Then click `Save` 
make your dataset available for purchase.

Required:
* The dataset file encrypted with the public key of the container that will perform the computation.
    *   You can download the public key of a container on the `Computation` page at the available containers.
* Name of the dataset
* Description of the dataset
* Cost in Ether 

#### Container provider

From the menu on top, click on the `Containers` tab and enter the details. Then click `Save`
to make your docker container available.

Required:
* Docker container ID
* Public key of docker 
* Cost in Ether


#### Computation
From the menu on top, click on the `Computation` tab and then:
1) Upload your public key. It will be used by the container to encrypt the result.
2) Select the algorithm you want to run.
3) Select the datase you want to use.
4) Select the container that will perform the computation.
Click `Run` in order to start the computation. 

The result is an IPFS address and it will be displayed in the `Log` area at the bottom of the `Computation` page.