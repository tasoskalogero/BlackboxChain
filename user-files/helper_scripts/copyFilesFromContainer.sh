if [ "$#" -ne 1 ]; then
    echo "Illegal number of parameters - Name of container is missing"
    exit 1
fi

declare -a arr=("wrapper.sh" "getDataset.py" "getSoftware.py" "writeResult.py" "decryptRandomKey.sh" "generatekeys.sh" "randomKeyGen.sh")

for i in "${arr[@]}"
do
	docker cp "$1:$i" .
done