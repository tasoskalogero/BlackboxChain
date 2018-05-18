#!/bin/bash

private_key=""
encr_key_path=""
output_filename=""

private_flag=false
key_flag=false

usage="$(basename "$0") [-h] [-p] [-r] -- program to decrypt a random one-time key using a private key and return the plaintext key

where:
    -h  show this help text
    -p  path to private key
    -r  path to encrypted random one-time key"

if [ $# -eq 0 ];
then
    echo "$usage"
    exit 0
fi
while getopts ":hp:r:" opt; do
  case $opt in
    h)
      echo "$usage"
      exit 0
      ;;
    p)
      private_key=$OPTARG
      private_flag=true

      if [ $key_flag = true ]
      then
        echo $(openssl rsautl -decrypt -inkey $private_key -in $encr_key_path)
      fi
      ;;
    r)
      encr_key_path=$OPTARG
      key_flag=true
      if [ $private_flag = true ]
      then
        echo $(openssl rsautl -decrypt -inkey $private_key -in $encr_key_path)
      fi
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      exit 1
      ;;
  esac
done
