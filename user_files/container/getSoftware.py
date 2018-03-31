#!/usr/bin/python
import argparse
import ipfsapi

INSIDE_DOCKER_CONTAINER = True

parser = argparse.ArgumentParser(description='Read data from a given IPFS hash and create a file. Returns the name of the created file.')
parser.add_argument("ipfsHash", help="ipfs hash of the data", type=str)
parser.add_argument("swFilename", help="the name of the created file", type=str)
args = parser.parse_args()

try:
	if(INSIDE_DOCKER_CONTAINER):
		HOST_IP = "docker.for.mac.host.internal"
	else:
		HOST_IP = "127.0.0.1"


	api = ipfsapi.connect(HOST_IP, 5001)
	with open(args.swFilename, 'wb+') as out_file: 
		out_file.write(api.cat(args.ipfsHash))
except:
	sys.exit(1);