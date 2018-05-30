pragma solidity ^0.4.19;

/*
* Contact to store computations.
*/

contract ComputationRegistry {

    bytes32[] public computationIDs;

    // The computation can have 3 states
    enum ComputationStatus {PLACED, SUCCEEDED, CANCELLED}

    // Computation data structure
    struct ComputationInfo {
        bytes32 computationID;          // identifier of the computation
        bytes32 containerID;            // identifier of the container that will be used in the computation
        bytes32 datasetID;              // identifier of the dataset that will be used in the computation
        bytes32 softwareID;             // identifier of the software that will be used in the computation
        address owner;                  // address of the recipient of the computation output
        uint amount;                    // total amount paid for the computation
        ComputationStatus status;       // status of the computation
        bytes32 userPubKeyIpfsHash;     // IPFS address containing the cryptographic public key of the owner
    }

    mapping(bytes32 => ComputationInfo) public idToComputationInfo;
    mapping(address => bool) accessAllowed;

    function ComputationRegistry() public {
        accessAllowed[msg.sender] = true;
    }

    // allow an address to access contract's methods
    function allowAccess(address _address) onlyIfAllowed public {
        accessAllowed[_address] = true;
    }

    // called by an allowed address to add a new computation
    function addComputation(bytes32 _id, bytes32 _userPubKeyIpfsHash, bytes32 _datasetID, bytes32 _softwareID, bytes32 _containerID, uint _amount, address _owner) onlyIfAllowed public returns (bool res) {

        idToComputationInfo[_id].computationID = _id;
        idToComputationInfo[_id].containerID = _containerID;
        idToComputationInfo[_id].userPubKeyIpfsHash = _userPubKeyIpfsHash;
        idToComputationInfo[_id].datasetID = _datasetID;
        idToComputationInfo[_id].softwareID = _softwareID;
        idToComputationInfo[_id].owner = _owner;
        idToComputationInfo[_id].amount = _amount;
        idToComputationInfo[_id].status = ComputationStatus.PLACED;             // set initial status to PLACED
        computationIDs.push(_id);

        return true;
    }

    // transfer funds to the corresponding providers after a successful computation
    function computationSuccess(bytes32 _computationID) onlyIfPlaced(_computationID) onlyIfAllowed public returns (bool success) {
        idToComputationInfo[_computationID].status = ComputationStatus.SUCCEEDED;
        return true;
    }

    // cancel a placed computation
    function computationFailure(bytes32 _computationID) onlyIfPlaced(_computationID) onlyIfAllowed public returns (bool success) {
        idToComputationInfo[_computationID].status = ComputationStatus.CANCELLED;
        return true;
    }

    modifier onlyIfAllowed () {
        require(accessAllowed[msg.sender] == true);
        _;
    }

    modifier onlyIfPlaced(bytes32 computationID) {
        require(idToComputationInfo[computationID].status == ComputationStatus.PLACED);
        _;
    }

    // return information about the given computation
    function getComputationInfo(bytes32 _computationID) public constant returns(bytes32 _dsID, bytes32 _swID, bytes32 _contID) {
        return(idToComputationInfo[_computationID].datasetID, idToComputationInfo[_computationID].softwareID, idToComputationInfo[_computationID].containerID);
    }

    // return specific information about the given computation
    function getComputationPaymentInfo(bytes32 _computationID) public constant returns(address owner, uint amount) {
        return(idToComputationInfo[_computationID].owner, idToComputationInfo[_computationID].amount);
    }

}
