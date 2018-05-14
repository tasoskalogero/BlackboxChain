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

    modifier onlyIfAllowed() {
        require(accessAllowed[msg.sender] == true);
        _;
    }

    //datasetId => DatasetInfo
    mapping(bytes32 => DatasetInfo) idToDatasetRegistry;

    mapping(address => bool) accessAllowed;


    function DatasetRegistry() public {
        accessAllowed[msg.sender] = true;
    }


    function allowAccess(address _address) onlyIfAllowed public {
        accessAllowed[_address] = true;
    }


    // @param BigchainDb Transaction ID, checksum, cost of using the container
    function addDataset(bytes32 _id, string _bcdbTxID, string _checksum, uint _cost, address _owner) onlyIfAllowed public returns (bool success) {
        datasetIdentifiers.push(_id);

        idToDatasetRegistry[_id].bcdbTxID = _bcdbTxID;
        idToDatasetRegistry[_id].checksum = _checksum;
        idToDatasetRegistry[_id].cost = _cost;
        idToDatasetRegistry[_id].owner = _owner;
        return true;
    }

    // @return Array with dataset ids
    function getDatasetIDs() public view returns (bytes32[]) {
        return datasetIdentifiers;
    }

    // @param Dataset id
    // @return DatasetInfo properties
    function getDatasetByID(bytes32 _id) public view returns (string _bcdbTxID, string checksum, uint cost, address owner) {
        return (idToDatasetRegistry[_id].bcdbTxID, idToDatasetRegistry[_id].checksum, idToDatasetRegistry[_id].cost, idToDatasetRegistry[_id].owner);
    }

    // @param Dataset id
    // @return Cost of using dataset, owner of the dataset - used by OrderDb to handle payment
    function getPaymentInfo(bytes32 _id) public view returns (uint _cost, address _owner) {
        return (idToDatasetRegistry[_id].cost, idToDatasetRegistry[_id].owner);
    }
}

