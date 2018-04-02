#!/usr/bin/python
import argparse
import base64
from bigchaindb_driver import BigchainDB
import sys

INSIDE_DOCKER_CONTAINER = True

parser = argparse.ArgumentParser(description='Fetch data from IPFS and create a file. Returns the created filename.')
parser.add_argument("bdbTxID", help="the hash on IPFS", type=str)
parser.add_argument("outFilename", help="the name of the created file", type=str)
args = parser.parse_args()

try: 
	# if(INSIDE_DOCKER_CONTAINER):
	# 	api = ipfsapi.connect('docker.for.mac.host.internal', 5001)
	# else:
	# 	api = ipfsapi.connect('127.0.0.1', 5001)

	# with open(args.outFilename, 'wb+') as out_file:
	# 	out_file.write(api.cat(args.ipfsHash))

	if(INSIDE_DOCKER_CONTAINER):
		bdb_root_url = 'docker.for.mac.host.internal:59984'
	else:
		bdb_root_url = 'http://localhost:59984'

	bdb = BigchainDB(bdb_root_url)

	asset = bdb.assets.get(search=args.bdbTxID)
	
	with open(args.outFilename, 'wb+') as out_file:
		encoded_data = asset[0]['data']['contents']
		decoded_data = base64.b64decode(encoded_data)
		out_file.write(decoded_data)

except:
	sys.exit(1);
