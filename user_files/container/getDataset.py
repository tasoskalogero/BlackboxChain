#!/usr/bin/python
import argparse
import base64
from bigchaindb_driver import BigchainDB

INSIDE_DOCKER_CONTAINER = True

parser = argparse.ArgumentParser(description='Fetch data from BigchainDB and create a file. Returns the created filename.')
parser.add_argument("bcdbTxID", help="the transaction ID on BigchainDB", type=str)
parser.add_argument("filename", help="the name of the created file", type=str)
args = parser.parse_args()

if(INSIDE_DOCKER_CONTAINER):
	bdb_root_url = 'docker.for.mac.host.internal:59984'
else:
	bdb_root_url = 'http://localhost:59984'

bdb = BigchainDB(bdb_root_url)

asset = bdb.assets.get(search=args.bcdbTxID)

with open(args.filename, 'wb+') as out_file:
	encoded_data = asset[0]['data']['contents']
	decoded_data = base64.b64decode(encoded_data)
	out_file.write(decoded_data)