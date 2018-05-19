### Container Provider
1) `docker build -t <image_name> .` to create an image based on the Dockerfile

2) run `docker run -t -i -d --name <container_name> <image_name> ` to run a container from the created image.

3) run `docker attach <containerID> to attach to the command line of running container

4) From inside the container run `generateKeys.sh` to generate private and public keys

5) Add the container filesystem in IPFS.

6) Store the container information on the blockchain/BigchainDB using the Dapp UI

### Dataset Provider

1) `randomKeyGen.sh` (helper_scripts) to generate a password

2) `generatekeys.sh` (helper_scripts) to generate public and private keys

3) `encryptLargeFile.sh` (helper_scripts) to encrypt the dataset with the password

4) `encryptRandomKey.sh` (helper_script) to encrypt the password with the public key of the container 

5) Add the encrypted dataset and password in IPFS and store addresses on the Blockchain/BigchainDB using the Dapp UI

### Software Provider

1) Add the software on the IPFS and store the IPFS address on the Blockchain/BigchainDB using the Dapp UI
