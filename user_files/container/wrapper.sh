#!/bin/bash

if [ "$#" -ne 3 ]; then
    echo "Illegal number of parameters"
    exit
fi

# $1 BCDB TxID of dataset
# $2 IPFS hash of software
# $3 user's public key
bcdbTxID=$1
swIPFSHash=$2
user_pub_key="$3"

# echo $bcdbTxID
# echo $swIPFSHash
# echo $user_pub_key

CIPHERTEXT_FILENAME="encrypted.txt"

FETCH_DATASET_FILE="getDataset.py"
FETCH_SW_FILE="getSoftware.py"
WRITE_TO_IPFS="writeResult.py"

CONTAINER_PRIVATE_KEY="keys/private.pem"
USER_PUB_KEY="user.pem"
RESULT_FILE="ipfs_encrypted.bin"

echo "$user_pub_key" > $USER_PUB_KEY

python3 $FETCH_DATASET_FILE $bcdbTxID $CIPHERTEXT_FILENAME

plaintext_data=$(./decrypt.sh -f $CIPHERTEXT_FILENAME -p $CONTAINER_PRIVATE_KEY)

SOFTWARE_FILENAME=$(python3 $FETCH_SW_FILE $swIPFSHash 2>&1)

plaintext_result=$(python $SOFTWARE_FILENAME "$plaintext_data" 2>&1)
echo $plaintext_result | openssl rsautl -encrypt -inkey $USER_PUB_KEY -pubin -out $RESULT_FILE

ipfs_address=$(python3 $WRITE_TO_IPFS $RESULT_FILE 2>&1)

echo $ipfs_address

rm $USER_PUB_KEY
rm $CIPHERTEXT_FILENAME
rm $SOFTWARE_FILENAME
rm $RESULT_FILE
