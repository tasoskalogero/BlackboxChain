pragma solidity ^0.4.19;
/*
* The RegistrytManager contract.
* Contains the logic for the registry contracts.
*/
import "./SoftwareRegistry.sol";
import "./DatasetRegistry.sol";
import "./ContainerRegistry.sol";

contract RegistryManager {
    SoftwareRegistry softwareRegistry;          // address of SoftwareRegistry contract
    DatasetRegistry datasetRegistry;            // address of DatasetRegistry contract
    ContainerRegistry containerRegistry;        // address of ContainerRegistry contract

    // store registry contract addresses
    function RegistryManager(address _datasetRegistryAddress, address _softwareRegistryAddress, address _containerRegistryAddress) public{
        softwareRegistry = SoftwareRegistry(_softwareRegistryAddress);
        datasetRegistry = DatasetRegistry(_datasetRegistryAddress);
        containerRegistry = ContainerRegistry(_containerRegistryAddress);
    }

    // call SoftwareRegistry contract to add a new dataset
    function addSoftwareInfo(string _bcdbTxID, string _checksum, uint _cost) public returns(bool success) {
        bytes32 id = keccak256(_bcdbTxID, _checksum, now);              // compute new software identifier
        softwareRegistry.addSoftware(id, _bcdbTxID, _checksum, _cost, msg.sender);
        return true;
    }

    // call DatasetRegistry contract to add a new dataset
    function addDatasetInfo(string _bcdbTxID, string _checksum, uint _cost) public returns(bool success) {
        bytes32 id = keccak256(_bcdbTxID, _checksum, now);              // compute new dataset identifier
        datasetRegistry.addDataset(id, _bcdbTxID, _checksum, _cost, msg.sender);
        return true;
    }

    // call ContainerRegistry contract to add a new container
    function addContainerInfo(string _bcdbTxID, string _checksum, uint _cost) public returns(bool success) {
        bytes32 id = keccak256(_bcdbTxID, _checksum, now);      // compute new container identifier
        containerRegistry.addContainer(id, _bcdbTxID, _checksum, _cost, msg.sender);
        return true;
    }
}
