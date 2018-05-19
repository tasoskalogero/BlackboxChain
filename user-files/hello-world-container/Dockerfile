#hello world container
FROM ubuntu:latest

COPY getDataset.py .
COPY getSoftware.py .
COPY writeResult.py .
COPY wrapper.sh .
COPY decryptRandomKey.sh .
COPY randomKeyGen.sh .
COPY generatekeys.sh .
COPY getRandomKey.py .

RUN apt-get update \
  && apt-get install -y python3-pip python3-dev \
  && pip3 install ipfsapi