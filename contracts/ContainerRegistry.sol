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
    //containerId => ContainerInfo
    mapping(bytes32 => ContainerInfo) containerRegistry;

    // @param BigchainDb Transaction ID, checksum, cost of using the container
    function addNewContainer(string _bcdbTxID, string _checksum, uint _cost) public returns(bool success) {
        bytes32 containerID = keccak256(_bcdbTxID, _checksum, now);

        containerIdentifiers.push(containerID);
        containerRegistry[containerID].bcdbTxID = _bcdbTxID;
        containerRegistry[containerID].checksum = _checksum;
        containerRegistry[containerID].cost = _cost;
        containerRegistry[containerID].owner = msg.sender;
        return true;
    }

    // @return Array with container ids
    function getContainerIDs() public view returns(bytes32[]) {
        return containerIdentifiers;
    }

    // @param Container id
    // @return ContainerInfo properties
    function getContainerByID(bytes32 _id) public view returns(string _bcdbTxID, string checksum, uint cost, address owner) {
        return (containerRegistry[_id].bcdbTxID, containerRegistry[_id].checksum, containerRegistry[_id].cost, containerRegistry[_id].owner);
    }

    // @param Container id
    // @return Cost of using container, owner of the container- used by OrderDb to handle payment
    function getPaymentInfo(bytes32 _id) public view returns(uint _cost, address _owner) {
        return (containerRegistry[_id].cost, containerRegistry[_id].owner);
    }
}

