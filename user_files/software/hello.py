#!/usr/bin/python

# Run in python3
# IPFS QmX8CUR8sWMh2Kh4km2AzVTJTYewz7f9ugKuApmYskd57L
import argparse

parser = argparse.ArgumentParser(description='Download code from a url.')
parser.add_argument("input", help="input data to print ", type=str)
args = parser.parse_args()

print("Hello\n", args.input)