pragma solidity ^0.4.19;

contract DatasetRegistry {

  struct Dataset {
    string bcdbID;
    string checksum;
    address owner;
  }

  bytes32[] datasetIdentifiers;
  //id => Dataset
  mapping(bytes32 => Dataset) datasetRegistry;

  function addNewDataset(string _bcdbID, string _checksum) public returns(bool success) {
    bytes32 datasetID = keccak256(_bcdbID, _checksum, now);

    datasetIdentifiers.push(datasetID);
    datasetRegistry[datasetID].bcdbID = _bcdbID;
    datasetRegistry[datasetID].checksum = _checksum;
    datasetRegistry[datasetID].owner = msg.sender;
    return true;
  }
  function getDatasetIDs() public view returns(bytes32[]) {
    return datasetIdentifiers;
  }

  function getDatasetByID(bytes32 _id) public view returns(string _bcdbID, string checksum, address owner) {
    return (datasetRegistry[_id].bcdbID, datasetRegistry[_id].checksum, datasetRegistry[_id].owner);
  }
}

