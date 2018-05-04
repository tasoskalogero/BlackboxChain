pragma solidity ^0.4.19;

import "./SoftwareRegistry.sol";
import "./DatasetRegistry.sol";
import "./ContainerRegistry.sol";

contract RegistryManager {
    SoftwareRegistry softwareRegistry;
    DatasetRegistry datasetRegistry;
    ContainerRegistry containerRegistry;

    function RegistryManager(address _datasetRegistryAddress, address _softwareRegistryAddress, address _containerRegistryAddress) public{
        softwareRegistry = SoftwareRegistry(_softwareRegistryAddress);
        datasetRegistry = DatasetRegistry(_datasetRegistryAddress);
        containerRegistry = ContainerRegistry(_containerRegistryAddress);
    }

    function addSoftwareInfo(string _bcdbTxID, string _checksum, uint _cost) public returns(bool success) {
        bytes32 id = keccak256(_bcdbTxID, _checksum, now);
        softwareRegistry.addSoftware(id, _bcdbTxID, _checksum, _cost, msg.sender);
        return true;
    }

    function addDatasetInfo(string _bcdbTxID, string _checksum, uint _cost) public returns(bool success) {
        bytes32 id = keccak256(_bcdbTxID, _checksum, now);
        datasetRegistry.addDataset(id, _bcdbTxID, _checksum, _cost, msg.sender);
        return true;
    }

    function addContainerInfo(string _bcdbTxID, string _checksum, uint _cost) public returns(bool success) {
        bytes32 id = keccak256(_bcdbTxID, _checksum, now);
        containerRegistry.addContainer(id, _bcdbTxID, _checksum, _cost, msg.sender);
        return true;
    }

}
