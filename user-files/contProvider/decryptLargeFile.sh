#!/bin/bash

#MIGHT NOT NEEDED

random_key=""
encr_file_path=""
output_filename=""

random_flag=false
data_flag=false

usage="$(basename "$0") [-h] [-r] [-f] -- program to decrypt a large file using an one-time random key password and return plaintext

where:
    -h  show this help text
    -r  random one-time key password
    -f  path to encrypted file"

if [ $# -eq 0 ];
then
    echo "$usage"
    exit 0
fi
while getopts ":hr:f:" opt; do
  case $opt in
    h)
      echo "$usage"
      exit 0
      ;;
    r)
      random_key=$OPTARG
      random_flag=true

      if [ $data_flag = true ]
      then
        # echo $(openssl rsautl -decrypt -inkey $random_key -in $encr_file_path)
        echo $(openssl enc -d -aes-256-cbc -in $encr_file_path -pass pass:$random_key)
      fi
      ;;
    f)
      encr_file_path=$OPTARG
      data_flag=true
      if [ $random_flag = true ]
      then
        echo $(openssl enc -d -aes-256-cbc -in $encr_file_path -pass pass:$random_key)
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
