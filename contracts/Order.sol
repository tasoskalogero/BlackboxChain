pragma solidity ^0.4.18;

contract DatasetRegistry {
    function getDatasetPaymentInfo(bytes32)view returns(uint,address) {}
}

contract SoftwareRegistry {
    function getSoftwarePaymentInfo(bytes32)view returns(uint,address) {}
}

contract ContainerRegistry {
    function getContainerPaymentInfo(bytes32)view returns(uint,address) {}
}

contract Order {

    address ORACLE = 0x5aeda56215b167893e80b4fe645ba6d5bab767de;

    struct OrderStruct {
        bytes32 orderID;

        bytes32 containerID;
        bytes32 datasetID;
        bytes32 softwareID;

        bytes32 result;

        address buyer;
        uint totalAmount;
    }

    event OrderPlaced (
        bytes32 indexed orderID,
        bytes32 indexed containerID,
        bytes32 indexed datasetID,
        bytes32 softwareID
    );

    event OrderResult (
        bytes32 result,
        address buyer
    );

    bytes32[] orderIDs;
    mapping(bytes32 => OrderStruct) orderRegistry;

    DatasetRegistry ds;
    ContainerRegistry cont;
    SoftwareRegistry sw;

    function Order(address _swAddr, address _dsAddr, address _contAddr) {
        ds = DatasetRegistry(_dsAddr);
        sw = SoftwareRegistry(_swAddr);
        cont = ContainerRegistry(_contAddr);
    }


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

        OrderPlaced(newOrderID, _containerID, _datasetID, _softwareID);

        return true;
    }


    //TODO check if order has already been paid - add a bool flag
    function executePayment(bytes32 _orderID, bytes32 _result) public returns(bool){
        require(msg.sender == ORACLE);

        var (ds_cost, ds_owner) = ds.getDatasetPaymentInfo(orderRegistry[_orderID].datasetID);

        var (sw_cost, sw_owner) = sw.getSoftwarePaymentInfo(orderRegistry[_orderID].softwareID);

        var (cont_cost, cont_owner) = cont.getContainerPaymentInfo(orderRegistry[_orderID].containerID);

        ds_owner.transfer(ds_cost);
        sw_owner.transfer(sw_cost);
        cont_owner.transfer(cont_cost);

        orderRegistry[_orderID].result = _result;
        OrderResult(orderRegistry[_orderID].result, orderRegistry[_orderID].buyer);

        return true;
    }

    //    function returnFunds(bytes32 paymentID) public returns(bool) {
//        require(msg.sender == ORACLE);
//        paymentEntries[paymentID].buyer.transfer(paymentEntries[paymentID].totalAmount);
//    }
}