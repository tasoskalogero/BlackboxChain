pragma solidity ^0.4.19;

contract DatasetRegistry {

  struct Dataset {
    string bcdbTxID;
    string checksum;
    uint cost;
    address owner;
  }

  bytes32[] datasetIdentifiers;
  //id => Dataset
  mapping(bytes32 => Dataset) datasetRegistry;

  function addNewDataset(string _bcdbTxID, string _checksum, uint _cost) public returns(bool success) {
    bytes32 datasetID = keccak256(_bcdbTxID, _checksum, now);

    datasetIdentifiers.push(datasetID);
    datasetRegistry[datasetID].bcdbTxID = _bcdbTxID;
    datasetRegistry[datasetID].checksum = _checksum;
    datasetRegistry[datasetID].cost = _cost;
    datasetRegistry[datasetID].owner = msg.sender;
    return true;
  }
  function getDatasetIDs() public view returns(bytes32[]) {
    return datasetIdentifiers;
  }

  function getDatasetByID(bytes32 _id) public view returns(string _bcdbTxID, string checksum, uint cost, address owner) {
    return (datasetRegistry[_id].bcdbTxID, datasetRegistry[_id].checksum, datasetRegistry[_id].cost, datasetRegistry[_id].owner);
  }

  function getDatasetPaymentInfo(bytes32 _id) public view returns(uint _cost, address _owner) {
      return (datasetRegistry[_id].cost, datasetRegistry[_id].owner);
  }
}

