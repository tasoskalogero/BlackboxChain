pragma solidity ^0.4.19;

contract ContainerRegistry {

    struct Container {
        string bcdbID;
        string checksum;
        address owner;
    }

    bytes32[] containerIdentifiers;
    //id => Container
    mapping(bytes32 => Container) containerRegistry;

    function addNewContainer(string _bcdbID, string _checksum) public returns(bool success) {
        bytes32 containerID = keccak256(_bcdbID, _checksum, now);

        containerIdentifiers.push(containerID);
        containerRegistry[containerID].bcdbID = _bcdbID;
        containerRegistry[containerID].checksum = _checksum;
        containerRegistry[containerID].owner = msg.sender;
        return true;
    }
    function getContainerIDs() public view returns(bytes32[]) {
        return containerIdentifiers;
    }

    function getContainerByID(bytes32 _id) public view returns(string _bcdbID, string checksum, address owner) {
        return (containerRegistry[_id].bcdbID, containerRegistry[_id].checksum, containerRegistry[_id].owner);
    }
}

