pragma solidity ^0.4.19;

/*
* Contact to store dataset information.
*/

contract DatasetRegistry {

    bytes32[] datasetIdentifiers;

    struct DatasetInfo {
        string bcdbTxID;
        string checksum;
        uint cost;
        address owner;
    }

    //datasetId => DatasetInfo
    mapping(bytes32 => DatasetInfo) datasetRegistry;

    // @param BigchainDb Transaction ID, checksum, cost of using the container
    function addNewDataset(string _bcdbTxID, string _checksum, uint _cost) public returns (bool success) {
        bytes32 datasetID = keccak256(_bcdbTxID, _checksum, now);

        datasetIdentifiers.push(datasetID);
        datasetRegistry[datasetID].bcdbTxID = _bcdbTxID;
        datasetRegistry[datasetID].checksum = _checksum;
        datasetRegistry[datasetID].cost = _cost;
        datasetRegistry[datasetID].owner = msg.sender;
        return true;
    }

    // @return Array with dataset ids
    function getDatasetIDs() public view returns (bytes32[]) {
        return datasetIdentifiers;
    }

    // @param Dataset id
    // @return DatasetInfo properties
    function getDatasetByID(bytes32 _id) public view returns (string _bcdbTxID, string checksum, uint cost, address owner) {
        return (datasetRegistry[_id].bcdbTxID, datasetRegistry[_id].checksum, datasetRegistry[_id].cost, datasetRegistry[_id].owner);
    }

    // @param Dataset id
    // @return Cost of using dataset, owner of the dataset - used by OrderDb to handle payment
    function getPaymentInfo(bytes32 _id) public view returns (uint _cost, address _owner) {
        return (datasetRegistry[_id].cost, datasetRegistry[_id].owner);
    }
}

