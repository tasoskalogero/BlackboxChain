#!/usr/bin/python
import argparse
import ipfsapi
import sys

parser = argparse.ArgumentParser(description='Read data from a given IPFS hash and create a file. Returns the name of the created file.')
parser.add_argument("swIPFSHash", help="ipfs hash of the data", type=str)
parser.add_argument("swFilename", help="the name of the created file", type=str)
args = parser.parse_args()

try:
		# bdb_root_url = 'docker.for.mac.host.internal:59984'

	# bdb = BigchainDB(bdb_root_url)

	# GET THE HASH OF THE SOFTWARE ON IPFS FROM BIGCHAINDB
	# asset = bdb.assets.get(search=args.bdbTxID)

	# swIPFSHash = asset[0]['data']['ipfsHash']

	api = ipfsapi.connect('docker.for.mac.host.internal', 5001)
	# WRITE FILE WITH THE RETRIEVED SOFTWARE
	with open(args.swFilename, 'wb+') as out_file: 
		out_file.write(api.cat(args.swIPFSHash))
except:
	sys.exit(1);
