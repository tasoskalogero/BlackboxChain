#!/usr/bin/python

import base64
import sys
import argparse
import ipfsapi


parser = argparse.ArgumentParser(description='Decode a base64 string.')
parser.add_argument("randomKey", help="the random key encoded in base64", type=str)
parser.add_argument("outFilename", help="the name of the created file", type=str)
args = parser.parse_args()

try: 
	api = ipfsapi.connect('docker.for.mac.host.internal', 5001)
	with open(args.outFilename, 'wb+') as out_file:
		out_file.write(api.cat(args.randomKey))

except:
	sys.exit(1);
