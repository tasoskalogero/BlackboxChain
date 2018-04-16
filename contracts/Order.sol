pragma solidity ^0.4.18;

contract DatasetRegistry {
    function getDatasetPaymentInfo(bytes32) view returns (uint, address) {}
}

contract SoftwareRegistry {
    function getSoftwarePaymentInfo(bytes32) view returns (uint, address) {}
}

contract ContainerRegistry {
    function getContainerPaymentInfo(bytes32) view returns (uint, address) {}
}

contract Order {

    address ORACLE = 0x5aeda56215b167893e80b4fe645ba6d5bab767de;

    struct OrderStruct {
        bytes32 orderID;

        bytes32 containerID;
        bytes32 datasetID;
        bytes32 softwareID;

        bool pending;

        address buyer;
        uint totalAmount;
    }

    event OrderPlaced (
        bytes32 indexed orderID,
        bytes32 indexed containerID,
        bytes32 indexed datasetID,
        bytes32 softwareID
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


    function getOrderByID(bytes32 orderID) public view returns (bytes32 _contID, bytes32 _dsID, bytes32 _swID, uint _amount, address _buyer){
        return (orderRegistry[orderID].containerID, orderRegistry[orderID].datasetID, orderRegistry[orderID].softwareID, orderRegistry[orderID].totalAmount, orderRegistry[orderID].buyer);

    }

    function newOrder(bytes32 _containerID, bytes32 _datasetID, bytes32 _softwareID) public payable returns (bool){

        bytes32 newOrderID = keccak256(_containerID, _datasetID, _softwareID, now);

        orderRegistry[newOrderID].orderID = newOrderID;

        orderRegistry[newOrderID].containerID = _containerID;
        orderRegistry[newOrderID].datasetID = _datasetID;
        orderRegistry[newOrderID].softwareID = _softwareID;

        orderRegistry[newOrderID].pending = true;

        orderRegistry[newOrderID].buyer = msg.sender;
        orderRegistry[newOrderID].totalAmount = msg.value;

        OrderPlaced(newOrderID, _containerID, _datasetID, _softwareID);

        return true;
    }


    function executePayment(bytes32 _orderID) public returns (bool){
        require(msg.sender == ORACLE);
        require(orderRegistry[_orderID].pending == true);

        var (ds_cost, ds_owner) = ds.getDatasetPaymentInfo(orderRegistry[_orderID].datasetID);

        var (sw_cost, sw_owner) = sw.getSoftwarePaymentInfo(orderRegistry[_orderID].softwareID);

        var (cont_cost, cont_owner) = cont.getContainerPaymentInfo(orderRegistry[_orderID].containerID);

        ds_owner.transfer(ds_cost);
        sw_owner.transfer(sw_cost);
        cont_owner.transfer(cont_cost);
        orderRegistry[_orderID].pending = false;
        return true;
    }

    function returnFunds(bytes32 _orderID) public returns (bool) {
        require(msg.sender == ORACLE);
        orderRegistry[_orderID].buyer.transfer(orderRegistry[_orderID].totalAmount);
    }
}