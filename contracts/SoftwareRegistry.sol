pragma solidity ^0.4.19;

contract SoftwareRegistry {
    struct Software {
        string bcdbTxID;
        string checksum;
        uint cost;
        address owner;
    }

    bytes32[] softwareIdentifiers;
    //id => Software
    mapping(bytes32 => Software) softwareRegistry;

    function addNewSoftware(string _bcdbTxID, string _checksum, uint _cost) public returns(bool success) {
        bytes32 swID = keccak256(_bcdbTxID, _checksum, now);

        softwareIdentifiers.push(swID);
        softwareRegistry[swID].bcdbTxID = _bcdbTxID;
        softwareRegistry[swID].checksum = _checksum;
        softwareRegistry[swID].cost = _cost;
        softwareRegistry[swID].owner = msg.sender;
        return true;
    }
    function getSoftwareIDs() public view returns(bytes32[]) {
        return softwareIdentifiers;
    }

    function getSoftwareByID(bytes32 _id) public view returns(string _bcdbTxID, string checksum, uint cost, address owner) {
        return (softwareRegistry[_id].bcdbTxID, softwareRegistry[_id].checksum, softwareRegistry[_id].cost, softwareRegistry[_id].owner);
    }

    function getPaymentInfo(bytes32 _id) public view returns(uint _cost, address _owner) {
        return (softwareRegistry[_id].cost, softwareRegistry[_id].owner);
    }
}

