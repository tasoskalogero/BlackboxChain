pragma solidity ^0.4.19;

import "./ComputationRegistry.sol";
import "./DatasetRegistry.sol";
import "./SoftwareRegistry.sol";
import "./ContainerRegistry.sol";

contract ComputationManager {

    address oracleAddress;

    event ComputationAdded (
        bytes32 indexed computationID,
        bytes32 indexed containerID,
        bytes32 indexed datasetID,
        bytes32 softwareID,
        bytes32 userPubKeyIpfsHash
    );

    ComputationRegistry computationRegistry;
    DatasetRegistry datasetRegistry;
    SoftwareRegistry softwareRegistry;
    ContainerRegistry containerRegistry;

    modifier onlyOracle {
        require(msg.sender == oracleAddress);
        _;
    }

    function ComputationManager(address _computationRegistryAddress, address _datasetRegistryAddress, address _softwareRegistryAdderss, address _containerRegistryAddress, address _oracleAddress) public {
        computationRegistry = ComputationRegistry(_computationRegistryAddress);
        datasetRegistry = DatasetRegistry(_datasetRegistryAddress);
        softwareRegistry = SoftwareRegistry(_softwareRegistryAdderss);
        containerRegistry = ContainerRegistry(_containerRegistryAddress);
        oracleAddress = _oracleAddress;
    }

    function addComputationInfo(bytes32 _uPubKeyIpfsHash, bytes32 _datasetID, bytes32 _softwareID, bytes32 _containerID) public payable returns(bool success) {
        bytes32 id = keccak256(_datasetID, _softwareID, _containerID, now);
        bool stored = computationRegistry.addComputation(id, _uPubKeyIpfsHash, _datasetID, _softwareID, _containerID, msg.value, msg.sender);
        if(stored) {
            ComputationAdded(id, _containerID, _datasetID, _softwareID, _uPubKeyIpfsHash);
            return true;
        }
        return false;
    }

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

    function computationFailed(bytes32 _computationID) onlyOracle public returns(bool success) {
        bool res = computationRegistry.computationFailure(_computationID);
        if(res) {
            var(owner, amount) = computationRegistry.getComputationPaymentInfo(_computationID);
            owner.transfer(amount);
            return true;
        }
        return false;
    }

    /*
    * Get information about the dataset stored in an computation.
    * @param dataset id
    * return dataset cost and owner
    */
    function getDatasetPaymentInfo(bytes32 _datasetID) private constant returns (uint cost, address owner) {
        var (ds_cost, ds_owner) = datasetRegistry.getPaymentInfo(_datasetID);
        return (ds_cost, ds_owner);
    }

    /*
    * Get information about the software stored in an computation.
    * @param software id
    * return software cost and owner
    */
    function getSoftwarePaymentInfo(bytes32 _softwareID) private constant returns (uint cost, address owner) {
        var (sw_cost, sw_owner) = softwareRegistry.getPaymentInfo(_softwareID);
        return (sw_cost, sw_owner);
    }

    /*
    * Get information about the container stored in an computation.
    * @param container id
    * return container cost and owner
    */
    function getContainerPaymentInfo(bytes32 _containerID) private constant returns (uint cost, address owner) {
        var (cont_cost, cont_owner) = containerRegistry.getPaymentInfo(_containerID);
        return (cont_cost, cont_owner);
    }


}
