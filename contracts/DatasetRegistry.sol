pragma solidity ^0.4.19;

/*
* Contact to store dataset resources.
*/

contract DatasetRegistry {

    bytes32[] datasetIdentifiers;

    // Dataset data structure
    struct DatasetInfo {
        string bcdbTxID;        // bigchainDB transaction id with the metadata of the dataset
        string checksum;        // hash of the metadata
        uint cost;              // cost of using the dataset
        address owner;          // address of the dataset provider
    }

    mapping(bytes32 => DatasetInfo) idToDatasetRegistry;
    mapping(address => bool) accessAllowed;

    function DatasetRegistry() public {
        accessAllowed[msg.sender] = true;
    }

    // allow address to access contract's methods
    function allowAccess(address _address) onlyIfAllowed public {
        accessAllowed[_address] = true;
    }

    // RegistryManager contract calls this method to add a new dataset
    function addDataset(bytes32 _id, string _bcdbTxID, string _checksum, uint _cost, address _owner) onlyIfAllowed public returns (bool success) {
        datasetIdentifiers.push(_id);

        idToDatasetRegistry[_id].bcdbTxID = _bcdbTxID;
        idToDatasetRegistry[_id].checksum = _checksum;
        idToDatasetRegistry[_id].cost = _cost;
        idToDatasetRegistry[_id].owner = _owner;
        return true;
    }

    modifier onlyIfAllowed() {
        require(accessAllowed[msg.sender] == true);
        _;
    }

    // returns the identifiers of the datasets
    function getDatasetIDs() public view returns (bytes32[]) {
        return datasetIdentifiers;
    }

    // returns the information about the given dataset
    function getDatasetByID(bytes32 _id) public view returns (string _bcdbTxID, string checksum, uint cost, address owner) {
        return (idToDatasetRegistry[_id].bcdbTxID, idToDatasetRegistry[_id].checksum, idToDatasetRegistry[_id].cost, idToDatasetRegistry[_id].owner);
    }

    // return specific information about the given dataset
    function getPaymentInfo(bytes32 _id) public view returns (uint _cost, address _owner) {
        return (idToDatasetRegistry[_id].cost, idToDatasetRegistry[_id].owner);
    }
}

