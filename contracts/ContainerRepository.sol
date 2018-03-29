pragma solidity ^0.4.16;

contract ContainerRepository {

  struct ContainerInfo {
    bytes32 id;
    string bdbId;
    address owner;
  }

  bytes32[] containerIdentifiers;
  //id => CodeInfo
  mapping(bytes32 => ContainerInfo) containerInventory;


  function addNewContainer(string _bdbId) public
  returns(bool success) {

    bytes32 newId = keccak256(_bdbId, now);
    containerIdentifiers.push(newId);

    containerInventory[newId].id = newId;
    containerInventory[newId].bdbId = _bdbId;
    containerInventory[newId].owner = msg.sender;
    return true;
  }

  function getContainerIDs() public view returns(bytes32[] ids) {
    return containerIdentifiers;
  }

  //TODO fix in payment
//  function getContainerPurchaseInfoByID(bytes32 _id) public view returns(uint cost, address owner) {
//    return(containerInventory[_id].cost, containerInventory[_id].owner);
//  }

  function getContainerByID(bytes32 _id) public view returns(bytes32 id,string bdbId) {
    return (containerInventory[_id].id, containerInventory[_id].bdbId);
  }

}
