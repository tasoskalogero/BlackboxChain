pragma solidity ^0.4.19;
/*
* The ComputationManager contract.
* Contains the logic for the ComputationRegistry contract.
*/
import "./ComputationRegistry.sol";
import "./DatasetRegistry.sol";
import "./SoftwareRegistry.sol";
import "./ContainerRegistry.sol";

contract ComputationManager {

    address oracleAddress;          // address of trusted third-party

    // event for new computations
    event ComputationAdded (
        bytes32 indexed computationID,          // computation identifier
        bytes32 indexed containerID,            // container identifier used by the computation
        bytes32 indexed datasetID,              // dataset identifier used by the computation
        bytes32 softwareID,                     // software identifier used by the computation
        bytes32 userPubKeyIpfsHash              // IPFS address of the recipient's public key
    );

    ComputationRegistry computationRegistry;        // address of ComputationRegistry contract
    DatasetRegistry datasetRegistry;                // address of DatasetRegistry contract
    SoftwareRegistry softwareRegistry;              // address of SoftwareRegistry contract
    ContainerRegistry containerRegistry;            // address of ContainerRegistry contract

    // store registry contract and oracle addresses
    function ComputationManager(address _computationRegistryAddress, address _datasetRegistryAddress, address _softwareRegistryAdderss, address _containerRegistryAddress, address _oracleAddress) public {
        computationRegistry = ComputationRegistry(_computationRegistryAddress);
        datasetRegistry = DatasetRegistry(_datasetRegistryAddress);
        softwareRegistry = SoftwareRegistry(_softwareRegistryAdderss);
        containerRegistry = ContainerRegistry(_containerRegistryAddress);
        oracleAddress = _oracleAddress;
    }

    // call ComputationRegistry contract to add a new computation
    function addComputationInfo(bytes32 _uPubKeyIpfsHash, bytes32 _datasetID, bytes32 _softwareID, bytes32 _containerID) public payable returns(bool success) {
        bytes32 id = keccak256(_datasetID, _softwareID, _containerID, now);         // compute new computation identifier

        bool stored = computationRegistry.addComputation(id, _uPubKeyIpfsHash, _datasetID, _softwareID, _containerID, msg.value, msg.sender);
        if(stored) {
            ComputationAdded(id, _containerID, _datasetID, _softwareID, _uPubKeyIpfsHash);              // trigger event for success
            return true;
        }
        return false;
    }

    // called by the oracle to transfer funds to the providers after a successful computation
    function computationSucceed(bytes32 _computationID) onlyOracle public returns(bool success) {
        bool res = computationRegistry.computationSuccess(_computationID);
        if(res) {
            var (ds_id, sw_id, cont_id) = computationRegistry.getComputationInfo(_computationID);

            var (ds_cost, ds_owner) = getDatasetPaymentInfo(ds_id);

            var (sw_cost, sw_owner) = getSoftwarePaymentInfo(sw_id);

            var (cont_cost, cont_owner) = getContainerPaymentInfo(cont_id);

            ds_owner.transfer(ds_cost);
            sw_owner.transfer(sw_cost);
            cont_owner.transfer(cont_cost);
            return true;
        }
        return false;
    }

    // called by the oracle to return funds to the recipient of the computation output after a failed computation
    function computationFailed(bytes32 _computationID) onlyOracle public returns(bool success) {
        bool res = computationRegistry.computationFailure(_computationID);
        if(res) {
            var(owner, amount) = computationRegistry.getComputationPaymentInfo(_computationID);
            owner.transfer(amount);
            return true;
        }
        return false;
    }

    modifier onlyOracle {
        require(msg.sender == oracleAddress);
        _;
    }

    // call DatasetRegistry contract to get information about the given dataset
    function getDatasetPaymentInfo(bytes32 _datasetID) private constant returns (uint cost, address owner) {
        var (ds_cost, ds_owner) = datasetRegistry.getPaymentInfo(_datasetID);
        return (ds_cost, ds_owner);
    }

    // call SoftwareRegistry contract to get information about the given software
    function getSoftwarePaymentInfo(bytes32 _softwareID) private constant returns (uint cost, address owner) {
        var (sw_cost, sw_owner) = softwareRegistry.getPaymentInfo(_softwareID);
        return (sw_cost, sw_owner);
    }

    // call ContainerRegistry contract to get information about the given container
    function getContainerPaymentInfo(bytes32 _containerID) private constant returns (uint cost, address owner) {
        var (cont_cost, cont_owner) = containerRegistry.getPaymentInfo(_containerID);
        return (cont_cost, cont_owner);
    }
}
