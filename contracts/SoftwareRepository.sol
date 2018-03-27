pragma solidity ^0.4.18;

contract SoftwareRepository {

  struct SoftwareInfo {
    bytes32 id;       //keccak from (filename, paramDescr, description)
    string filename;
    string ipfsAddress;
    string paramDescr;
    string description;
    address owner;
  }
  bytes32[] softwareIdentifiers;
  //id => SoftwareInfo
  mapping(bytes32 => SoftwareInfo) softwareInventory;

  function addSoftware(string _filename, string _ipfsAddress, string _paramDescr, string _description) public
  returns(bool success) {

    bytes32 softwareID = keccak256(_filename, _paramDescr, _description);
    softwareIdentifiers.push(softwareID);
    softwareInventory[softwareID].id = softwareID;
    softwareInventory[softwareID].filename =_filename;
    softwareInventory[softwareID].ipfsAddress = _ipfsAddress;
    softwareInventory[softwareID].paramDescr = _paramDescr;
    softwareInventory[softwareID].description = _description;
    softwareInventory[softwareID].owner = msg.sender;
    return true;
  }


  function getSoftwareIDs() public view returns(bytes32[]) {
    return softwareIdentifiers;
  }

  function getSoftwareByID(bytes32 _id) public view returns(string filename, string ipfsAddress, string paramDescr, string description) {
    return (softwareInventory[_id].filename , softwareInventory[_id].ipfsAddress, softwareInventory[_id].paramDescr, softwareInventory[_id].description);

  }

}
