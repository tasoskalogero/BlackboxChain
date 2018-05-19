#!/usr/bin/python
import argparse
import ipfsapi
import sys

parser = argparse.ArgumentParser(description='Read data from a given IPFS hash and create a file. Returns the name of the created file.')
parser.add_argument("swIPFSHash", help="ipfs hash of the data", type=str)
parser.add_argument("swFilename", help="the name of the created file", type=str)
args = parser.parse_args()

try:

	api = ipfsapi.connect('docker.for.mac.host.internal', 5001)
#	api = ipfsapi.connect('localhost', 5001)
	# WRITE FILE WITH THE RETRIEVED SOFTWARE
	with open(args.swFilename, 'wb+') as out_file: 
		out_file.write(api.cat(args.swIPFSHash))
except:
	sys.exit(1);
