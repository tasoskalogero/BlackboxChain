#!/bin/bash
usage="$(basename "$0") [-h] [-d] -- generate public and private key pair

where:
    -h  show this help text
    -d  directory to generate keys"

private_key_filename="private.pem"
pub_key_filename="pub.pem"

if [ $# -eq 0 ];
then
    # echo "Invalid number of arguments."
    echo "$usage"
    exit 0
fi
while getopts ":hd:" dir_name; do
  case $dir_name in
    h)
      echo "$usage"
      exit
      ;; 
    d)
      echo "-d was triggered, Parameter: $OPTARG" >&2
      mkdir $OPTARG
      openssl genrsa -out $OPTARG/$private_key_filename 1024
      openssl rsa -in $OPTARG/$private_key_filename -pubout -out $OPTARG/$pub_key_filename
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