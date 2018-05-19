#!/bin/bash

dataIPFS=$1
passwordIPFS=$2

ipfs cat $dataIPFS > result.enc
ipfs cat $passwordIPFS  > key.bin.enc

openssl rsautl -decrypt -inkey ../keys/userPrivKey.pem -in key.bin.enc -out key.bin
openssl enc -d -aes-256-cbc -in result.enc -out result.bin -pass file:./key.bin

rm key.bin.enc
rm result.enc

echo "Result stored in result.enc file"
