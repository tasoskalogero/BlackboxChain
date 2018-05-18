#!/bin/bash

# decrypt the one-time password and decrypt the dataset using this password and save the plaintext in a file

randKey=$(./decryptRandomKey.sh -p keys/privCont.pem -r ../dsProvider/key.bin.enc)

openssl enc -d -aes-256-cbc -in ../dsProvider/test_dataset.txt.enc -pass pass:$randKey > data.txt

