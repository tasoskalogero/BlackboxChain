pragma solidity ^0.4.18;

contract Payment {

    address ORACLE = 0x5aeda56215b167893e80b4fe645ba6d5bab767de;

    struct PaymentDetails {
        bytes32 paymentID;

        bytes32 containerID;
        uint containerCost;
        address  containerOwner;

        bytes32 datasetID;
        uint datasetCost;
        address  datasetOwner;

        bytes32 softwareID;
        uint softwareCost;
        address  softwareOwner;

        address buyer;
        uint totalAmount;
    }

    bytes32[] paymentIDs;
    mapping(bytes32 => PaymentDetails) paymentEntries;

    function createNewPayment(
        bytes32 newID,
        bytes32 _containerID,
        uint _containerCost,
        address  _containerOwner,
        bytes32 _datasetID,
        uint _datasetCost,
        address  _datasetOwner,
        bytes32 _softwareID,
        uint _softwareCost,
        address  _softwareOwner) public payable returns(bool){

        uint totalAmount = _containerCost + _datasetCost + _softwareCost;

        require(msg.value == totalAmount);

        paymentEntries[newID].paymentID = newID;

        paymentEntries[newID].containerID = _containerID;
        paymentEntries[newID].containerCost= _containerCost;
        paymentEntries[newID].containerOwner= _containerOwner;

        paymentEntries[newID].datasetID = _datasetID;
        paymentEntries[newID].datasetCost = _datasetCost;
        paymentEntries[newID].datasetOwner = _datasetOwner;

        paymentEntries[newID].softwareID = _softwareID;
        paymentEntries[newID].softwareCost= _softwareCost;
        paymentEntries[newID].softwareOwner = _softwareOwner;

        paymentEntries[newID].totalAmount = msg.value;
        paymentEntries[newID].buyer = msg.sender;
        return true;

    }

    function executePayment(bytes32 paymentID) public returns(bool){
        require(msg.sender == ORACLE);

        paymentEntries[paymentID].datasetOwner.transfer(paymentEntries[paymentID].datasetCost);
        paymentEntries[paymentID].containerOwner.transfer(paymentEntries[paymentID].containerCost);
        paymentEntries[paymentID].softwareOwner.transfer(paymentEntries[paymentID].softwareCost);
        return true;
    }
}