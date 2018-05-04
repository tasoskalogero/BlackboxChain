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

    modifier onlyIfAllowed () {
        require(accessAllowed[msg.sender] == true);
        _;
    }

    //softwareId => SoftwareInfo
    mapping(bytes32 => SoftwareInfo) softwareRegistry;

    //access is allowed to creator and RegistryManager
    mapping(address => bool) accessAllowed;

    function SoftwareRegistry() public {
        accessAllowed[msg.sender] = true;
    }


    function allowAccess(address _address) onlyIfAllowed public {
        accessAllowed[_address] = true;
    }

    // @param BigchainDb Transaction ID, checksum, cost of using the container
    function addSoftware(bytes32 _id, string _bcdbTxID, string _checksum, uint _cost, address _owner) onlyIfAllowed  public returns(bool success) {
        softwareIdentifiers.push(_id);

        softwareRegistry[_id].bcdbTxID = _bcdbTxID;
        softwareRegistry[_id].checksum = _checksum;
        softwareRegistry[_id].cost = _cost;
        softwareRegistry[_id].owner = _owner;
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

