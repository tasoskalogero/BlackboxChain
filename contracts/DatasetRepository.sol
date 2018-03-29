pragma solidity ^0.4.18;

contract DatasetRepository {

  struct DatasetInfo {
    bytes32 id;
    string bdbId;
    address owner;
  }

  bytes32[] dsIdentifiers;
  //dsId => DatasetInfo
  mapping(bytes32 => DatasetInfo) datasetInventory;

  function addNewDataset(string _bdbId) public
    returns(bool success) {

    bytes32 newId = keccak256(_bdbId, now);
    dsIdentifiers.push(newId);

    datasetInventory[newId].id = newId;
    datasetInventory[newId].bdbId = _bdbId;
    datasetInventory[newId].owner = msg.sender;

    return true;
  }

  function getDatasetIDs() public view returns(bytes32[] ids) {
    return dsIdentifiers;
  }

  //TODO fix in payment
//  function getDatasetPurchaseInfoByID(bytes32 _id) public view returns(uint cost, address owner) {
//    return(datasetInventory[_id].dsCost, datasetInventory[_id].owner);
//  }

  function getDatasetByID(bytes32 _id) public view returns(bytes32 id, string bdbId) {
    return (datasetInventory[_id].id, datasetInventory[_id].bdbId);
  }
}