pragma solidity ^0.4.19;
/*
* The ContainerRegistryContract.
* Store container resources.
*/
contract ContainerRegistry {

    bytes32[] containerIdentifiers;

    // Container data structure
    struct ContainerInfo {
        string bcdbTxID;        // bigchainDB transaction id with the metadata of the container
        string checksum;        // hash of the metadata
        uint cost;              // cost of using the container
        address owner;          // address of the container provider
    }

    mapping(bytes32 => ContainerInfo) idToContainerInfo;
    mapping(address => bool) accessAllowed;


    function ContainerRegistry() public {
        accessAllowed[msg.sender] = true;
    }

    // allow an address to access contract's methods
    function allowAccess(address _address) onlyIfAllowed public {
        accessAllowed[_address] = true;
    }

    // RegistryManager contract calls this method to add a new container
    function addContainer(bytes32 _id, string _bcdbTxID, string _checksum, uint _cost, address _owner) onlyIfAllowed public returns(bool success) {
        containerIdentifiers.push(_id);

        idToContainerInfo[_id].bcdbTxID = _bcdbTxID;
        idToContainerInfo[_id].checksum = _checksum;
        idToContainerInfo[_id].cost = _cost;
        idToContainerInfo[_id].owner = _owner;
        return true;
    }

    modifier onlyIfAllowed () {
        require(accessAllowed[msg.sender] == true);
        _;
    }

    // returns the identifiers of the containers
    function getContainerIDs() public view returns(bytes32[]) {
        return containerIdentifiers;
    }

    // returns the information about the given container
    function getContainerByID(bytes32 _id) public view returns(string _bcdbTxID, string checksum, uint cost, address owner) {
        return (idToContainerInfo[_id].bcdbTxID, idToContainerInfo[_id].checksum, idToContainerInfo[_id].cost, idToContainerInfo[_id].owner);
    }

    // return specific information about the given container
    function getPaymentInfo(bytes32 _id) public view returns(uint _cost, address _owner) {
        return (idToContainerInfo[_id].cost, idToContainerInfo[_id].owner);
    }
}

