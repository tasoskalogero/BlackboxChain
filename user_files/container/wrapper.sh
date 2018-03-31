#!/bin/bash

if [ "$#" -ne 3 ]; then
    echo "Illegal number of parameters"
    exit 1
fi

error_exit() {
	echo "$1" 1>&2
	clean_files
	exit 1
}

clean_files() {
	rm -f -- $USER_PUB_KEY
	rm -f -- $CIPHERTEXT_FILENAME
	rm -f -- $SOFTWARE_FILE
	rm -f -- $RESULT_FILE
}

# $1 IPFS Hash of dataset
# $2 IPFS hash of software
# $3 user's public key
dsIPFSHash=$1
swIPFSHash=$2
user_pub_key="$3"

# echo $dsIPFSHash
# echo $swIPFSHash
# echo $user_pub_key

CIPHERTEXT_FILENAME="cipher.enc"
SOFTWARE_FILE="fetchedSoftware.py"

FETCH_DATASET_FILE="getDataset.py"
FETCH_SW_FILE="getSoftware.py"
WRITE_TO_IPFS="writeResult.py"

CONTAINER_PRIVATE_KEY="private.pem"
USER_PUB_KEY="user.pem"
RESULT_FILE="ipfs_encrypted.bin"

echo "$user_pub_key" > $USER_PUB_KEY

python3 $FETCH_DATASET_FILE $dsIPFSHash $CIPHERTEXT_FILENAME
if [ "$?" = "1" ]; then
	error_exit "Error fetching dataset file. Aborting."
fi

plaintext_data=$(./decrypt.sh -f $CIPHERTEXT_FILENAME -p $CONTAINER_PRIVATE_KEY)
if [ "$?" = "1" ]; then
	error_exit "Error decrypting data. Aborting."
fi

python3 $FETCH_SW_FILE $swIPFSHash $SOFTWARE_FILE
if [ "$?" = "1" ]; then
	error_exit "Error fetching sofwtare. Aborting."	
fi

plaintext_result=$(python3 $SOFTWARE_FILE "$plaintext_data" 2>&1)
if [ "$?" = "1" ]; then
	error_exit "Error executing sofwtare. Aborting."	
fi

echo $plaintext_result | openssl rsautl -encrypt -inkey $USER_PUB_KEY -pubin -out $RESULT_FILE
if [ "${PIPESTATUS[1]}" = "1" ]; then
	error_exit "Unable to encrypt result. Aborting."
fi

ipfs_address=$(python3 $WRITE_TO_IPFS $RESULT_FILE 2>&1)
if [ "$?" = "1" ]; then
	error_exit "Error writting result on IPFS. Aborting."	
fi

echo $ipfs_address
clean_files

