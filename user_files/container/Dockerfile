# FROM ubuntu:latest

# COPY requirements.txt .

# COPY getDataset.py .
# COPY getSoftware.py .
# COPY writeResult.py .
# COPY wrapper.sh .

# RUN apt-get update && apt-get install -y \
# 	libffi-dev g++ libssl-dev nano\
#   python3  \
#   python3-pip && pip3 install --upgrade pip && \
#   pip install -r requirements.txt &&  \
#   rm requirements.txt

FROM alpine:latest

COPY requirements.txt .

COPY getDataset.py .
COPY getSoftware.py .
COPY writeResult.py .
COPY wrapper.sh .
COPY decrypt.sh .
COPY generatekeys.sh .

RUN apk add --update \
		bash \
		openssl \
		python3 && \
		pip3 install --upgrade pip && \
		pip3 install -r requirements.txt && \
		rm requirements.txt \
		rm -rf /var/cache/apk/* 

# ENTRYPOINT ["./generatekeys.sh", "-d", "keys"]
# ENTRYPOINT ["echo","TTTT"]

