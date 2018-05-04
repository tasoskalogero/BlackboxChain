pragma solidity ^0.4.19;

contract ComputationRegistry {

    bytes32[] public computationIDs;

    modifier onlyIfPlaced(bytes32 computationID) {
        require(computations[computationID].status == ComputationStatus.PLACED);
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
    }
    //compuation id to ComputationInfo
    mapping(bytes32 => ComputationInfo) public computations;

    mapping(address => bool) accessAllowed;

    function ComputationRegistry() public {
        accessAllowed[msg.sender] = true;
    }

    function allowAccess(address _address) onlyIfAllowed public {
        accessAllowed[_address] = true;
    }

    //@param container id, software id, dataset id and owner of the computation
    function addComputation(bytes32 _id, bytes32 _datasetID, bytes32 _softwareID, bytes32 _containerID, uint _amount, address _owner) onlyIfAllowed public returns (bool res) {

        computations[_id].computationID = _id;
        computations[_id].containerID = _containerID;
        computations[_id].datasetID = _datasetID;
        computations[_id].softwareID = _softwareID;

        computations[_id].owner = _owner;

        computations[_id].amount = _amount;

        computations[_id].status = ComputationStatus.PLACED;

        computationIDs.push(_id);

        return true;
    }

    /*
    * Complete the computation by transferring  funds to the providers.
    * @param computation id
    */
    function computationSuccess(bytes32 _computationID) onlyIfPlaced(_computationID) onlyIfAllowed public returns (bool success) {
        computations[_computationID].status = ComputationStatus.SUCCEED;
        return true;
    }

    /*
    * Cancel an already placed computation.
    * @param computation id
    */
    function computationFailure(bytes32 _computationID) onlyIfPlaced(_computationID) onlyIfAllowed public returns (bool success) {
        computations[_computationID].status = ComputationStatus.CANCELLED;
        return true;
    }


    function getComputationPaymentInfo(bytes32 _computationID) public constant returns(address owner, uint amount) {
        return(computations[_computationID].owner,computations[_computationID].amount);
    }

    function getComputationInfo(bytes32 _computationID) public constant returns(bytes32 _dsID, bytes32 _swID, bytes32 _contID) {
        return(computations[_computationID].datasetID, computations[_computationID].softwareID, computations[_computationID].containerID);
    }

}
