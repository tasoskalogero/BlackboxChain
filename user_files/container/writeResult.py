#!/usr/bin/python

import argparse
import ipfsapi

parser = argparse.ArgumentParser(description='Add file to IPFS.')
parser.add_argument("datafile", help="file to store on IPFS", type=str)
args = parser.parse_args()

INSIDE_DOCKER_CONTAINER = True

data_to_write = args.datafile

if(INSIDE_DOCKER_CONTAINER):
	HOST_IP = "docker.for.mac.host.internal"
else:
	HOST_IP = "127.0.0.1"


RESULT_FILE = data_to_write

api = ipfsapi.connect(HOST_IP, 5001)

res = api.add(data_to_write)

print(res['Hash'])