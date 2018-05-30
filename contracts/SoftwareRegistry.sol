pragma solidity ^0.4.19;
/*
* The SoftwareRegistry contract.
* Store software resources.
*/
contract SoftwareRegistry {

    bytes32[] softwareIdentifiers;

    // Software data structure
    struct SoftwareInfo {
        string bcdbTxID;        // bigchainDB transaction id with the metadata of the software
        string checksum;        // hash of the metadata
        uint cost;              // cost of using the software
        address owner;          // address of the software provider
    }

    //softwareId => SoftwareInfo
    mapping(bytes32 => SoftwareInfo) idToSoftwareInfo;
    mapping(address => bool) accessAllowed;

    function SoftwareRegistry() public {
        accessAllowed[msg.sender] = true;
    }

    // allow an address to access contract's methods
    function allowAccess(address _address) onlyIfAllowed public {
        accessAllowed[_address] = true;
    }

    // RegistryManager contract calls this method to add a new software
    function addSoftware(bytes32 _id, string _bcdbTxID, string _checksum, uint _cost, address _owner) onlyIfAllowed  public returns(bool success) {
        softwareIdentifiers.push(_id);

        idToSoftwareInfo[_id].bcdbTxID = _bcdbTxID;
        idToSoftwareInfo[_id].checksum = _checksum;
        idToSoftwareInfo[_id].cost = _cost;
        idToSoftwareInfo[_id].owner = _owner;
        return true;
    }

    modifier onlyIfAllowed () {
        require(accessAllowed[msg.sender] == true);
        _;
    }

    // returns the identifiers of the software
    function getSoftwareIDs() public view returns(bytes32[]) {
        return softwareIdentifiers;
    }

    // returns the information about the given software
    function getSoftwareByID(bytes32 _id) public view returns(string _bcdbTxID, string checksum, uint cost, address owner) {
        return (idToSoftwareInfo[_id].bcdbTxID, idToSoftwareInfo[_id].checksum, idToSoftwareInfo[_id].cost, idToSoftwareInfo[_id].owner);
    }

    // return specific information about the given software
    function getPaymentInfo(bytes32 _id) public view returns(uint _cost, address _owner) {
        return (idToSoftwareInfo[_id].cost, idToSoftwareInfo[_id].owner);
    }
}

