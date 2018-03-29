pragma solidity ^0.4.18;

contract SoftwareRepository {

  struct SoftwareInfo {
    bytes32 id;
    string bdbId;
    address owner;
  }
  bytes32[] softwareIdentifiers;
  //id => SoftwareInfo
  mapping(bytes32 => SoftwareInfo) softwareInventory;

  function addNewSoftware(string _bdbId) public
  returns(bool success) {

    bytes32 newId = keccak256(_bdbId, now);
    softwareIdentifiers.push(newId);
    softwareInventory[newId].id = newId;
      softwareInventory[newId].bdbId = _bdbId;
    softwareInventory[newId].owner = msg.sender;
    return true;
  }


  function getSoftwareIDs() public view returns(bytes32[]) {
    return softwareIdentifiers;
  }

  function getSoftwareByID(bytes32 _id) public view returns(bytes32 id, string bdbId) {
    return (softwareInventory[_id].id, softwareInventory[_id].bdbId);

  }

}
