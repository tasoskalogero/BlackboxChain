pragma solidity ^0.4.19;

contract ComputationRegistry {

    bytes32[] public computationIDs;

    modifier onlyIfPlaced(bytes32 computationID) {
        require(idToComputationInfo[computationID].status == ComputationStatus.PLACED);
        _;
    }

    modifier onlyIfAllowed () {
        require(accessAllowed[msg.sender] == true);
        _;
    }

    enum ComputationStatus {PLACED, SUCCEED, CANCELLED}

    struct ComputationInfo {
        bytes32 computationID;
        bytes32 containerID;
        bytes32 datasetID;
        bytes32 softwareID;
        address owner;
        uint amount;
        ComputationStatus status;
        bytes32 userPubKeyIpfsHash;
    }
    //computation id to ComputationInfo
    mapping(bytes32 => ComputationInfo) public idToComputationInfo;

    mapping(address => bool) accessAllowed;

    function ComputationRegistry() public {
        accessAllowed[msg.sender] = true;
    }

    function allowAccess(address _address) onlyIfAllowed public {
        accessAllowed[_address] = true;
    }

    //@param container id, software id, dataset id and owner of the computation
    function addComputation(bytes32 _id, bytes32 _userPubKeyIpfsHash, bytes32 _datasetID, bytes32 _softwareID, bytes32 _containerID, uint _amount, address _owner) onlyIfAllowed public returns (bool res) {

        idToComputationInfo[_id].computationID = _id;
        idToComputationInfo[_id].containerID = _containerID;
        idToComputationInfo[_id].userPubKeyIpfsHash = _userPubKeyIpfsHash;
        idToComputationInfo[_id].datasetID = _datasetID;
        idToComputationInfo[_id].softwareID = _softwareID;

        idToComputationInfo[_id].owner = _owner;

        idToComputationInfo[_id].amount = _amount;

        idToComputationInfo[_id].status = ComputationStatus.PLACED;

        computationIDs.push(_id);

        return true;
    }

    /*
    * Complete the computation by transferring  funds to the providers.
    * @param computation id
    */
    function computationSuccess(bytes32 _computationID) onlyIfPlaced(_computationID) onlyIfAllowed public returns (bool success) {
        idToComputationInfo[_computationID].status = ComputationStatus.SUCCEED;
        return true;
    }

    /*
    * Cancel an already placed computation.
    * @param computation id
    */
    function computationFailure(bytes32 _computationID) onlyIfPlaced(_computationID) onlyIfAllowed public returns (bool success) {
        idToComputationInfo[_computationID].status = ComputationStatus.CANCELLED;
        return true;
    }


    function getComputationPaymentInfo(bytes32 _computationID) public constant returns(address owner, uint amount) {
        return(idToComputationInfo[_computationID].owner, idToComputationInfo[_computationID].amount);
    }

    function getComputationInfo(bytes32 _computationID) public constant returns(bytes32 _dsID, bytes32 _swID, bytes32 _contID) {
        return(idToComputationInfo[_computationID].datasetID, idToComputationInfo[_computationID].softwareID, idToComputationInfo[_computationID].containerID);
    }

}
