#!/bin/bash

if [ "$#" -ne 3 ]; then
    echo "Illegal number of parameters"
    exit 1
fi

error_exit() {
	#echo "$1" 1>&2
	echo $1
	clean_files
	exit 1
}

clean_files() {
	rm -f -- $USER_PUB_KEY
	rm -f -- $CIPHERTEXT_FILENAME
	rm -f -- $SOFTWARE_FILE
	rm -f -- $RESULT_FILE
}

# $1 IPFS hash of dataset
dsIPFSHash=$1
# $2 IPFS hash of software
swIPFSHash=$2
# $3 user's public key
user_pub_key="$3"
# $4 random one-time password
random_key="$4"


CIPHERTEXT_FILENAME="dataset.enc"
SOFTWARE_FILE="fetchedSoftware.py"

FETCH_DATASET_FILE="getDataset.py"
FETCH_SW_FILE="getSoftware.py"
WRITE_TO_IPFS="writeResult.py"

CONTAINER_PRIVATE_KEY="keys/private.pem"
USER_PUB_KEY="userPubKey.pem"
RANDOM_KEY="key.bin"
RESULT_FILE="result.enc"

echo "$user_pub_key" > $USER_PUB_KEY
echo "$random_key" > $RANDOM_KEY

# get dataset (encrypted) file from IPFS
python3 $FETCH_DATASET_FILE $dsIPFSHash $CIPHERTEXT_FILENAME
if [ "$?" = "1" ]; then
	error_exit 600
fi

# decrypt random password
randKey_plaintext=$(./decryptRandKey.sh -p $CONTAINER_PRIVATE_KEY -r $RANDOM_KEY)
if [ "$?" = "1" ]; then
	error_exit 610
fi

# decrypt dataset using the random password
plaintext_data=$(openssl enc -d -aes-256-cbc -in $CIPHERTEXT_FILENAME -pass pass:$randKey_plaintext)
if [ "$?" = "1" ]; then
	error_exit 610
fi


# plaintext_data=$(sh decrypt.sh -f $CIPHERTEXT_FILENAME -p $CONTAINER_PRIVATE_KEY)
# if [ "$?" = "1" ]; then
# 	error_exit 610
# fi

# get software file from IPFS
python3 $FETCH_SW_FILE $swIPFSHash $SOFTWARE_FILE
if [ "$?" = "1" ]; then
	error_exit 620
fi

plaintext_result=$(python3 $SOFTWARE_FILE "$plaintext_data" 2>&1)
if [ "$?" = "1" ]; then
	error_exit 630
fi

echo $plaintext_result | openssl rsautl -encrypt -inkey $USER_PUB_KEY -pubin -out $RESULT_FILE
if [ "${PIPESTATUS[1]}" = "1" ]; then
	error_exit 640
fi

ipfs_address=$(python3 $WRITE_TO_IPFS $RESULT_FILE 2>&1)
if [ "$?" = "1" ]; then
	error_exit 650
fi

echo $ipfs_address
clean_files