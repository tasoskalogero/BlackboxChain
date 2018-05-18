#!/bin/bash
public_key=""
rand_key_path=""
output_filename=""

pub_flag=false
randKey_flag=false
out_flag=false

usage="$(basename "$0") [-h] [-p] [-r] [-o] -- encrypt a random key file using a public key

where:
    -h  show this help text
    -p  path to public key
    -r  path to random one-time key
    -o  output path to encrypted file"

if [ $# -eq 0 ];
then
    echo "$usage"
    exit 0
fi
while getopts ":hp:r:o:" opt; do
  case $opt in
    h)
      echo "$usage"
      exit 0
      ;;
    p)
      public_key=$OPTARG
      pub_flag=true

      if [ $randKey_flag = true ] && [ $out_flag = true ]
      then
				openssl rsautl -encrypt -inkey $public_key -pubin -in $rand_key_path -out $output_filename
      fi
      ;;
    r)
      rand_key_path=$OPTARG
      randKey_flag=true

      if [ $pub_flag = true ] && [ $out_flag = true ]
      then
				openssl rsautl -encrypt -inkey $public_key -pubin -in $rand_key_path -out $output_filename
      fi
      ;;
    o)
      output_filename=$OPTARG
      out_flag=true

      if [ $randKey_flag = true ] && [ $pub_flag = true ]
      then
				openssl rsautl -encrypt -inkey $public_key -pubin -in $rand_key_path -out $output_filename
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
