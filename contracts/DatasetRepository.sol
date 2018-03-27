pragma solidity ^0.4.18;

contract DatasetRepository {

  struct DatasetInfo {
    bytes32 dsId;     //keccak from (dsName, dsDescription,bcdbTxId)
    string dsName;
    string dsDescription;
    uint dsCost;              //Wei
    string bcdbTxId;
    address owner;
  }

  bytes32[] dsIdentifiers;
  //dsId => DatasetInfo
  mapping(bytes32 => DatasetInfo) datasetInventory;

  function addNewDataset(string _dsName, string _dsDescription, uint _dsCost, string _bcdbTxId) public
    returns(bool success) {

    bytes32 id = keccak256(_dsName,_dsDescription,_bcdbTxId);
    dsIdentifiers.push(id);

    datasetInventory[id].dsId = id;
    datasetInventory[id].dsName =_dsName;
    datasetInventory[id].dsDescription = _dsDescription;
    datasetInventory[id].dsCost = _dsCost;
    datasetInventory[id].bcdbTxId = _bcdbTxId;
    datasetInventory[id].owner = msg.sender;

    return true;
  }

  function getDatasetIDs() public view returns(bytes32[] ids) {
    return dsIdentifiers;
  }

  function getDatasetPurchaseInfoByID(bytes32 _id) public view returns(uint cost, address owner) {
    return(datasetInventory[_id].dsCost, datasetInventory[_id].owner);
  }

  function getDatasetByID(bytes32 _id) public view returns(string datasetName, string datasetDescription, uint cost, string bcdbTxId) {

    return (datasetInventory[_id].dsName, datasetInventory[_id].dsDescription, datasetInventory[_id].dsCost, datasetInventory[_id].bcdbTxId);
  }

}

//pragma solidity ^0.4.18;
//
//contract DatasetRepository {
//
//  struct DataInfo {
//    bytes32 datasetName;
//    bytes32 datasetDescription;
//    string cost;    //eg if original cost is decimal (0.0001), then store "1:4" where 4 is digits after the decimal point
//    string bcdbTxID;
//    address owner;            // key pointing to the One
//  }
//
//  DataInfo[] data;
//
//  function addDataset(
//    bytes32 _datasetName,
//    bytes32 _datasetDescription,
//    string _cost,
//    string _bcdbTxID) public returns(bool success) {
//
//    data.push(DataInfo(_datasetName, _datasetDescription, _cost, _bcdbTxID, msg.sender));
//    return true;
//  }
//
//  function getDataCount() public view
//  returns(uint length) {
//
//    return data.length;
//  }
//
//  function getDataAt(uint pos) public view
//  returns(bytes32 datasetName, bytes32 datasetDescription, string cost, string bcdbTxID ) {
//
//    return (data[pos].datasetName, data[pos].datasetDescription, data[pos].cost, data[pos].bcdbTxID);
//  }
//
//}
