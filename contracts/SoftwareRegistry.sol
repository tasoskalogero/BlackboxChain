pragma solidity ^0.4.19;

/*
* Contact to store software information.
*/

contract SoftwareRegistry {
    bytes32[] softwareIdentifiers;

    struct SoftwareInfo {
        string bcdbTxID;
        string checksum;
        uint cost;
        address owner;
    }
    //softwareId => SoftwareInfo
    mapping(bytes32 => SoftwareInfo) softwareRegistry;

    // @param BigchainDb Transaction ID, checksum, cost of using the container
    function addNewSoftware(string _bcdbTxID, string _checksum, uint _cost) public returns(bool success) {
        bytes32 swID = keccak256(_bcdbTxID, _checksum, now);

        softwareIdentifiers.push(swID);
        softwareRegistry[swID].bcdbTxID = _bcdbTxID;
        softwareRegistry[swID].checksum = _checksum;
        softwareRegistry[swID].cost = _cost;
        softwareRegistry[swID].owner = msg.sender;
        return true;
    }

    // @return Array with software ids
    function getSoftwareIDs() public view returns(bytes32[]) {
        return softwareIdentifiers;
    }

    // @param Software id
    // @return SoftwareInfo properties
    function getSoftwareByID(bytes32 _id) public view returns(string _bcdbTxID, string checksum, uint cost, address owner) {
        return (softwareRegistry[_id].bcdbTxID, softwareRegistry[_id].checksum, softwareRegistry[_id].cost, softwareRegistry[_id].owner);
    }

    // @param Software id
    // @return Cost of using software, owner of the software - used by OrderDb to handle payment
    function getPaymentInfo(bytes32 _id) public view returns(uint _cost, address _owner) {
        return (softwareRegistry[_id].cost, softwareRegistry[_id].owner);
    }
}

