pragma solidity ^0.4.16;

contract ContainerRepository {

  struct ContainerInfo {
    bytes32 id;
    string publicKey;
    uint cost;     //in wei
    bool status;
    address owner;
  }

  bytes32[] containerIdentifiers;
  //id => CodeInfo
  mapping(bytes32 => ContainerInfo) containerInventory;


  function addNewContainer(bytes32 _id, string _publicKey, uint _cost, bool _status) public
  returns(bool success) {

    containerIdentifiers.push(_id);

    containerInventory[_id].id = _id;
    containerInventory[_id].publicKey = _publicKey;
    containerInventory[_id].cost = _cost;
    containerInventory[_id].status = _status;
    containerInventory[_id].owner = msg.sender;
    return true;
  }

  function getContainerIDs() public view returns(bytes32[] ids) {
    return containerIdentifiers;
  }
  function getContainerPurchaseInfoByID(bytes32 _id) public view returns(uint cost, address owner) {
    return(containerInventory[_id].cost, containerInventory[_id].owner);
  }

  function getContainerByID(bytes32 _id) public view returns(bytes32 id, string publicKey, uint cost, bool status) {
    return (containerInventory[_id].id, containerInventory[_id].publicKey, containerInventory[_id].cost, containerInventory[_id].status);
  }

}
