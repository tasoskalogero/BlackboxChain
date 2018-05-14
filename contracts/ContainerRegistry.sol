pragma solidity ^0.4.19;

/*
* Contact to store container information.
*/

contract ContainerRegistry {

    bytes32[] containerIdentifiers;

    struct ContainerInfo {
        string bcdbTxID;
        string checksum;
        uint cost;
        address owner;
    }

    modifier onlyIfAllowed () {
        require(accessAllowed[msg.sender] == true);
        _;
    }

    //containerId => ContainerInfo
    mapping(bytes32 => ContainerInfo) idToContainerInfo;
    mapping(address => bool) accessAllowed;


    function ContainerRegistry() public {
        accessAllowed[msg.sender] = true;
    }

    function allowAccess(address _address) onlyIfAllowed public {
        accessAllowed[_address] = true;
    }

    // @param BigchainDb Transaction ID, checksum, cost of using the container
    function addContainer(bytes32 _id, string _bcdbTxID, string _checksum, uint _cost, address _owner) onlyIfAllowed public returns(bool success) {
        containerIdentifiers.push(_id);

        idToContainerInfo[_id].bcdbTxID = _bcdbTxID;
        idToContainerInfo[_id].checksum = _checksum;
        idToContainerInfo[_id].cost = _cost;
        idToContainerInfo[_id].owner = _owner;
        return true;
    }

    // @return Array with container ids
    function getContainerIDs() public view returns(bytes32[]) {
        return containerIdentifiers;
    }

    // @param Container id
    // @return ContainerInfo properties
    function getContainerByID(bytes32 _id) public view returns(string _bcdbTxID, string checksum, uint cost, address owner) {
        return (idToContainerInfo[_id].bcdbTxID, idToContainerInfo[_id].checksum, idToContainerInfo[_id].cost, idToContainerInfo[_id].owner);
    }

    // @param Container id
    // @return Cost of using container, owner of the container- used by OrderDb to handle payment
    function getPaymentInfo(bytes32 _id) public view returns(uint _cost, address _owner) {
        return (idToContainerInfo[_id].cost, idToContainerInfo[_id].owner);
    }
}

