#!/bin/bash
rand_key_path=""
data_file_path=""
output_filename=""

randKey_flag=false
data_flag=false
out_flag=false

usage="$(basename "$0") [-h] [-r] [-f] [-o] -- encrypt a large file using an one time random key

where:
    -h  show this help text
    -r  path to random one-time key
    -f  path to file for encryption
    -o  output path to encrypted file"

if [ $# -eq 0 ];
then
    echo "$usage"
    exit 0
fi
while getopts ":hf:r:o:" opt; do
  case $opt in
    h)
      echo "$usage"
      exit 0
      ;;
    r)
      rand_key_path=$OPTARG
      randKey_flag=true

      if [ $data_flag = true ] && [ $out_flag = true ]
      then
        openssl enc -aes-256-cbc -salt -in $data_file_path -out $output_filename -pass file:$rand_key_path
      fi
      ;;
    f)
      data_file_path=$OPTARG
      data_flag=true

      if [ $randKey_flag = true ] &&  [ $out_flag = true ]
      then
        openssl enc -aes-256-cbc -salt -in $data_file_path -out $output_filename -pass file:$rand_key_path
      fi
      ;;
    o)
      output_filename=$OPTARG
      out_flag=true

      if [ $randKey_flag = true ] && [ $data_flag = true ]
      then
        openssl enc -aes-256-cbc -salt -in $data_file_path -out $output_filename -pass file:$rand_key_path
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
