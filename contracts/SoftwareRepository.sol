pragma solidity ^0.4.18;

contract SoftwareRepository {

    struct SoftwareInfo {
        bytes32 id;       //keccak from ipfsHash
        string filename;
        string ipfsHash;
        string paramTypes;
        string description;
        uint cost;
        address owner;
    }
    bytes32[] softwareIdentifiers;
    //id => SoftwareInfo
    mapping(bytes32 => SoftwareInfo) softwareInventory;

    function addNewSoftware(string _filename, string _ipfsHash, string _paramTypes, string _description, uint _cost) public
    returns(bool success) {

        bytes32 softwareID = keccak256(_ipfsHash);

        softwareIdentifiers.push(softwareID);
        softwareInventory[softwareID].id = softwareID;
        softwareInventory[softwareID].filename =_filename;
        softwareInventory[softwareID].ipfsHash = _ipfsHash;
        softwareInventory[softwareID].paramTypes = _paramTypes;
        softwareInventory[softwareID].description = _description;
        softwareInventory[softwareID].cost = _cost;
        softwareInventory[softwareID].owner = msg.sender;
        return true;
    }


    function getSoftwareIDs() public view returns(bytes32[]) {
        return softwareIdentifiers;
    }

    function getSoftwareByID(bytes32 _id) public view returns(string filename, string ipfsHash, string paramTypes, string description, uint cost) {
        return (softwareInventory[_id].filename , softwareInventory[_id].ipfsHash, softwareInventory[_id].paramTypes, softwareInventory[_id].description, softwareInventory[_id].cost);

    }



}
