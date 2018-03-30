FROM ubuntu:latest

COPY requirements.txt .

COPY getDataset.py .
COPY getSoftware.py .
COPY writeResult.py .
COPY wrapper.sh .

RUN apt-get update && apt-get install -y \
	libffi-dev g++ libssl-dev nano\
  python3  \
  python3-pip && pip3 install --upgrade pip && \
  pip3 install -r requirements.txt &&  \
  rm requirements.txt