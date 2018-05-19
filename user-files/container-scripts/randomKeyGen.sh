#!/bin/bash
random_key_name=$1
openssl rand -base64 32 > $random_key_name