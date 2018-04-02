pragma solidity ^0.4.18;

contract DatasetRepository {

  struct DatasetInfo {
    bytes32 dsId;     //keccak from bcdbTxId
    string dsName;
    string dsDescription;
    uint dsCost;              //Wei
    string bdbTxID;
    address owner;
  }

  bytes32[] dsIdentifiers;
  //dsId => DatasetInfo
  mapping(bytes32 => DatasetInfo) datasetInventory;

  function addNewDataset(string _dsName, string _dsDescription, uint _dsCost, string _bdbTxID) public
  returns(bool success) {

    bytes32 id = keccak256(_bdbTxID);
    dsIdentifiers.push(id);

    datasetInventory[id].dsId = id;
    datasetInventory[id].dsName =_dsName;
    datasetInventory[id].dsDescription = _dsDescription;
    datasetInventory[id].dsCost = _dsCost;
    datasetInventory[id].bdbTxID = _bdbTxID;
    datasetInventory[id].owner = msg.sender;

    return true;
  }

  function getDatasetIDs() public view returns(bytes32[] ids) {
    return dsIdentifiers;
  }

  function getDatasetPurchaseInfoByID(bytes32 _id) public view returns(uint cost, address owner) {
    return(datasetInventory[_id].dsCost, datasetInventory[_id].owner);
  }

  function getDatasetByID(bytes32 _id) public view returns(string datasetName, string datasetDescription, uint cost, string bdbTxID) {

    return (datasetInventory[_id].dsName, datasetInventory[_id].dsDescription, datasetInventory[_id].dsCost, datasetInventory[_id].bdbTxID);
  }


}