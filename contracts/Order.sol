pragma solidity ^0.4.18;

contract Order {

    address ORACLE = 0x5aeda56215b167893e80b4fe645ba6d5bab767de;


    struct Order {
        bytes32 orderID;

        bytes32 containerID;
        bytes32 datasetID;
        bytes32 softwareID;

        address buyer;
        uint totalAmount;
    }

    event OrderEvent (
        bytes32 indexed orderID,
        bytes32 indexed containerID,
        bytes32 indexed datasetID,
        bytes32 softwareID
    );

    bytes32[] orderIDs;
    mapping(bytes32 => Order) orderRegistry;

    function getOrderByID(bytes32 orderID) public view returns(bytes32 _contID, bytes32 _dsID, bytes32 _swID, uint _amount){
        return(orderRegistry[orderID].containerID, orderRegistry[orderID].datasetID, orderRegistry[orderID].softwareID, orderRegistry[orderID].totalAmount);

    }

    function newOrder(bytes32 _containerID, bytes32 _datasetID, bytes32 _softwareID) public payable returns(bool){

        bytes32 newOrderID = keccak256(_containerID, _datasetID, _softwareID, now);

        orderRegistry[newOrderID].orderID = newOrderID;

        orderRegistry[newOrderID].containerID = _containerID;
        orderRegistry[newOrderID].datasetID = _datasetID;
        orderRegistry[newOrderID].softwareID = _softwareID;

        orderRegistry[newOrderID].totalAmount = msg.value;
        orderRegistry[newOrderID].buyer = msg.sender;

        OrderEvent(newOrderID, _containerID, _datasetID, _softwareID);

        return true;
    }

//    function executePayment(bytes32 paymentID) public returns(bool){
//        require(msg.sender == ORACLE);
//
//        paymentEntries[paymentID].datasetOwner.transfer(paymentEntries[paymentID].datasetCost);
//        paymentEntries[paymentID].containerOwner.transfer(paymentEntries[paymentID].containerCost);
//        paymentEntries[paymentID].softwareOwner.transfer(paymentEntries[paymentID].softwareCost);
//        return true;
//    }
//
//    function returnFunds(bytes32 paymentID) public returns(bool) {
//        require(msg.sender == ORACLE);
//        paymentEntries[paymentID].buyer.transfer(paymentEntries[paymentID].totalAmount);
//    }
}