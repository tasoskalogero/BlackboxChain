pragma solidity ^0.4.16;

contract ContainerRepository {

    struct ContainerInfo {
        bytes32 containerId;        //keccak (containerDockerID, now)
        string containerDockerID;
        string pubKey;
        uint cost;     //in wei
        address owner;
    }

    bytes32[] containerIdentifiers;
    //id => CodeInfo
    mapping(bytes32 => ContainerInfo) containerInventory;


    function addNewContainer(string _dockerID, string _publicKey, uint _cost) public
    returns(bool success) {

        bytes32 id = keccak256(_dockerID, now);
        containerIdentifiers.push(id);

        containerInventory[id].containerId = id;
        containerInventory[id].containerDockerID = _dockerID;
        containerInventory[id].pubKey = _publicKey;
        containerInventory[id].cost = _cost;
        containerInventory[id].owner = msg.sender;
        return true;
    }

    function getContainerIDs() public view returns(bytes32[] ids) {
        return containerIdentifiers;
    }

    function getContainerByID(bytes32 _id) public view returns(string containerDockerID, string publicKey, uint cost, address owner) {
        return (containerInventory[_id].containerDockerID, containerInventory[_id].pubKey, containerInventory[_id].cost, containerInventory[_id].owner);
    }

}
