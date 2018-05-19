#!/bin/bash

if [ "$#" -ne 4 ]; then
    echo "Illegal number of parameters"
    exit 1
fi

error_exit() {
	echo $1
	clean_files
	exit 1
}

clean_files() {
	rm -f -- $USER_PUB_KEY
	rm -f -- $CIPHERTEXT_FILENAME
	rm -f -- $SOFTWARE_FILE
	rm -f -- $RANDOM_KEY_FILE
	rm -f -- $RESULT_FILE
	rm -f -- $RANDOM_KEY_RESULT
	rm -f -- $RANDOM_KEY_RESULT_ENC
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
RANDOM_KEY_FILE="key.bin.enc"
RANDOM_KEY_RESULT="result_key.bin"
RANDOM_KEY_RESULT_ENC="result_key.enc"
RESULT_FILE="result.enc"

echo "$user_pub_key" > $USER_PUB_KEY

python3 getRandomKey.py "$random_key" $RANDOM_KEY_FILE

# get dataset (encrypted) file from IPFS
python3 $FETCH_DATASET_FILE $dsIPFSHash $CIPHERTEXT_FILENAME
if [ "$?" = "1" ]; then
	error_exit 600
fi

# decrypt random password
randKey_plaintext=$(./decryptRandomKey.sh -p $CONTAINER_PRIVATE_KEY -r $RANDOM_KEY_FILE)
if [ "$?" = "1" ]; then
	error_exit 610
fi

# decrypt dataset using the random password
plaintext_data=$(openssl enc -d -aes-256-cbc -in $CIPHERTEXT_FILENAME -pass pass:$randKey_plaintext -md md5)
if [ "$?" = "1" ]; then
	error_exit 610
fi


# get software file from IPFS
python3 $FETCH_SW_FILE $swIPFSHash $SOFTWARE_FILE
if [ "$?" = "1" ]; then
	error_exit 620
fi

# run software over the data and return result plaintext
plaintext_result=$(python3 $SOFTWARE_FILE "$plaintext_data" 2>&1)
if [ "$?" = "1" ]; then
	error_exit 630
fi


# Generate one time password to encrypt the result
./randomKeyGen.sh $RANDOM_KEY_RESULT

# Encrypt result with one time key
openssl enc -md md5 -aes-256-cbc -salt -in <(echo $plaintext_result) -out $RESULT_FILE -pass file:$RANDOM_KEY_RESULT

# Encrypt one time key user's public key
openssl rsautl -encrypt -inkey $USER_PUB_KEY -pubin -in $RANDOM_KEY_RESULT -out $RANDOM_KEY_RESULT_ENC

# store result in IPFS
ipfs_dataset_address=$(python3 $WRITE_TO_IPFS $RESULT_FILE 2>&1)
if [ "$?" = "1" ]; then
	error_exit 650
fi

# store password in IPFS 
ipfs_randKey_address=$(python3 $WRITE_TO_IPFS $RANDOM_KEY_RESULT_ENC 2>&1)
if [ "$?" = "1" ]; then
	error_exit 650
fi

#Return dataset ipfs address and random key ipfs address
output_arr[0]=$ipfs_dataset_address
output_arr[1]=$ipfs_randKey_address

echo ${output_arr[@]}
clean_files
