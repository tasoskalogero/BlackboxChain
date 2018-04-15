pragma solidity ^0.4.19;

contract ContainerRegistry {

    struct Container {
        string bcdbTxID;
        string checksum;
        uint cost;
        address owner;
    }

    bytes32[] containerIdentifiers;
    //id => Container
    mapping(bytes32 => Container) containerRegistry;

    function addNewContainer(string _bcdbTxID, string _checksum, uint _cost) public returns(bool success) {
        bytes32 containerID = keccak256(_bcdbTxID, _checksum, now);

        containerIdentifiers.push(containerID);
        containerRegistry[containerID].bcdbTxID = _bcdbTxID;
        containerRegistry[containerID].checksum = _checksum;
        containerRegistry[containerID].cost = _cost;
        containerRegistry[containerID].owner = msg.sender;
        return true;
    }
    function getContainerIDs() public view returns(bytes32[]) {
        return containerIdentifiers;
    }

    function getContainerByID(bytes32 _id) public view returns(string _bcdbTxID, string checksum, uint cost, address owner) {
        return (containerRegistry[_id].bcdbTxID, containerRegistry[_id].checksum, containerRegistry[_id].cost, containerRegistry[_id].owner);
    }

    function getContainerPaymentInfo(bytes32 _id) public view returns(uint _cost, address _owner) {
        return (containerRegistry[_id].cost, containerRegistry[_id].owner);
    }
}

