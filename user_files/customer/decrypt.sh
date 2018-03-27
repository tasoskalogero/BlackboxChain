#!/bin/bash

private_key=""
encr_file_path=""
output_filename=""

private_flag=false
data_flag=false

usage="$(basename "$0") [-h] [-p] [-f] -- program to decrypt a file using a private key and return the plaintext

where:
    -h  show this help text
    -p  path to private key
    -f  path to encrypted file"

if [ $# -eq 0 ];
then
    echo "$usage"
    exit 0
fi
while getopts ":hp:f:" opt; do
  case $opt in
    h)
      echo "$usage"
      exit 0
      ;;
    p)
      private_key=$OPTARG
      private_flag=true

      if [ $data_flag = true ]
      then
        echo $(openssl rsautl -decrypt -inkey $private_key -in $encr_file_path)
      fi
      ;;
    f)
      encr_file_path=$OPTARG
      data_flag=true
      if [ $private_flag = true ]
      then
        echo $(openssl rsautl -decrypt -inkey $private_key -in $encr_file_path)
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
