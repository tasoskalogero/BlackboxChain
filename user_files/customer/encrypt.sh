#!/bin/bash
public_key=""
data_file_path=""
output_filename=""

pub_flag=false
data_flag=false
out_flag=false

usage="$(basename "$0") [-h] [-p] [-f] [-o] -- encrypt a file using public key encryption

where:
    -h  show this help text
    -p  path to public key
    -f  path to file for encryption
    -o  output path to decrypted file"

if [ $# -eq 0 ];
then
    echo "$usage"
    exit 0
fi
while getopts ":hp:f:o:" opt; do
  case $opt in
    h)
      echo "$usage"
      exit 0
      ;;
    p)
      public_key=$OPTARG
      pub_flag=true

      if [ $data_flag = true ] && [ $out_flag = true ]
      then
        openssl rsautl -encrypt -inkey $public_key -pubin -in $data_file_path -out $output_filename
      fi
      ;;
    f)
      data_file_path=$OPTARG
      data_flag=true

      if [ $pub_flag = true ] &&  [ $out_flag = true ]
      then
        openssl rsautl -encrypt -inkey $public_key -pubin -in $data_file_path -out $output_filename
      fi
      ;;
    o)
      output_filename=$OPTARG
      out_flag=true

      if [ $pub_flag = true ] && [ $data_flag = true ]
      then
        openssl rsautl -encrypt -inkey $public_key -pubin -in $data_file_path -out $output_filename
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
