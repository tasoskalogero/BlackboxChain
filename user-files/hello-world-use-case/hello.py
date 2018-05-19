#!/usr/bin/python

import argparse

parser = argparse.ArgumentParser(description='Download code from a url.')
parser.add_argument("input", help="input data to print ", type=str)
args = parser.parse_args()

print("Hello ", args.input)