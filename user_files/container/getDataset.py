#!/usr/bin/python
import argparse
import base64
import ipfsapi
import sys

INSIDE_DOCKER_CONTAINER = True

parser = argparse.ArgumentParser(description='Fetch data from IPFS and create a file. Returns the created filename.')
parser.add_argument("ipfsHash", help="the hash on IPFS", type=str)
parser.add_argument("outFilename", help="the name of the created file", type=str)
args = parser.parse_args()

try: 
	if(INSIDE_DOCKER_CONTAINER):
		api = ipfsapi.connect('docker.for.mac.host.internal', 5001)
	else:
		api = ipfsapi.connect('127.0.0.1', 5001)

	with open(args.outFilename, 'wb+') as out_file:
		out_file.write(api.cat(args.ipfsHash))
except:
	sys.exit(1);