pragma solidity ^0.4.19;

contract SoftwareRegistry {
    struct Software {
        string bcdbID;
        string checksum;
        address owner;
    }

    bytes32[] softwareIdentifiers;
    //id => Software
    mapping(bytes32 => Software) softwareRegistry;

    function addNewSoftware(string _bcdbID, string _checksum) public returns(bool success) {
        bytes32 swID = keccak256(_bcdbID, _checksum, now);

        softwareIdentifiers.push(swID);
        softwareRegistry[swID].bcdbID = _bcdbID;
        softwareRegistry[swID].checksum = _checksum;
        softwareRegistry[swID].owner = msg.sender;
        return true;
    }
    function getSoftwareIDs() public view returns(bytes32[]) {
        return softwareIdentifiers;
    }

    function getSoftwareByID(bytes32 _id) public view returns(string _bcdbID, string checksum, address owner) {
        return (softwareRegistry[_id].bcdbID, softwareRegistry[_id].checksum, softwareRegistry[_id].owner);
    }
}

