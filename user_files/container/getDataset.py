#!/usr/bin/python
import argparse
import base64
from bigchaindb_driver import BigchainDB
import ipfsapi
import sys

parser = argparse.ArgumentParser(description='Fetch data from IPFS and create a file. Returns the created filename.')
parser.add_argument("datasetIPFSHash", help="the hash on IPFS", type=str)
parser.add_argument("outFilename", help="the name of the created file", type=str)
args = parser.parse_args()

try: 

	# bdb_root_url = 'docker.for.mac.host.internal:59984'
	api = ipfsapi.connect('docker.for.mac.host.internal', 5001)

	# bdb = BigchainDB(bdb_root_url)

	# asset = bdb.assets.get(search=args.bdbTxID)

	# datasetIPFSHash = asset[0]['data']['ipfsHash']

	# WRITE FILE WITH THE RETRIEVED SOFTWARE
	with open(args.outFilename, 'wb+') as out_file:
		out_file.write(api.cat(args.datasetIPFSHash))

	# with open(args.outFilename, 'wb+') as out_file:
	# 	encoded_data = asset[0]['data']['contents']
	# 	decoded_data = base64.b64decode(encoded_data)
	# 	out_file.write(decoded_data)

except:
	sys.exit(1);
