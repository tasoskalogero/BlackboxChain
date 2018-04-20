pragma solidity ^0.4.17;

contract DatasetRegistry {
    function getPaymentInfo(bytes32) view returns (uint, address) {}
}

contract SoftwareRegistry {
    function getPaymentInfo(bytes32) view returns (uint, address) {}
}

contract ContainerRegistry {
    function getPaymentInfo(bytes32) view returns (uint, address) {}
}


contract ContractProvider {
    function contracts(bytes32 name) public returns (address addr) {}
}

contract OrderDb {
    enum OrderStatus {PLACED, SUCCEED, CANCELLED}

    address cpAddr;
    address public orderM;

    struct OrderInfo {
        bytes32 orderID;
        bytes32 containerID;
        bytes32 datasetID;
        bytes32 softwareID;
        address buyer;
        uint amount;
        OrderStatus status;
    }

    mapping(bytes32 => OrderInfo) public orderRegistry;
    bytes32[] public orderIDs;

    event OrderPlaced (
        bytes32 indexed orderID,
        bytes32 indexed containerID,
        bytes32 indexed datasetID,
        bytes32 softwareID
    );

    function OrderDb(address contractProviderAddr) {
        cpAddr = contractProviderAddr;
    }

    modifier onlyIfPlaced(bytes32 orderID) {
        require(orderRegistry[orderID].status == OrderStatus.PLACED);
        _;

    }
    // only OrderManager can call this function
    function placeOrder(bytes32 _containerID, bytes32 _datasetID, bytes32 _softwareID, address _fromAddr) public payable returns (bool res) {
        address ordermanager = ContractProvider(cpAddr).contracts("ordermanager");
        if (ordermanager == 0x0) {
            msg.sender.transfer(msg.value);
            return false;
        }

        if (msg.sender == ordermanager) {
            bytes32 newOrderID = keccak256(_containerID, _datasetID, _softwareID, now);

            orderRegistry[newOrderID].orderID = newOrderID;
            orderRegistry[newOrderID].containerID = _containerID;
            orderRegistry[newOrderID].datasetID = _datasetID;
            orderRegistry[newOrderID].softwareID = _softwareID;

            orderRegistry[newOrderID].buyer = _fromAddr;
            orderRegistry[newOrderID].amount = msg.value;

            orderRegistry[newOrderID].amount = msg.value;

            orderRegistry[newOrderID].status = OrderStatus.PLACED;

            orderIDs.push(newOrderID);
            OrderPlaced(newOrderID, _containerID, _datasetID, _softwareID);

            return true;
        }

        msg.sender.transfer(msg.value);
        return false;
    }


    function getDatasetInfo(bytes32 _orderID) private returns (uint cost, address owner) {
        bytes32 dsID = orderRegistry[_orderID].datasetID;
        address datasetRegAddr = ContractProvider(cpAddr).contracts("datasetReg");
        var (ds_cost, ds_owner) = DatasetRegistry(datasetRegAddr).getPaymentInfo(dsID);
        return (ds_cost, ds_owner);
    }

    function getContainerInfo(bytes32 _orderID) private returns (uint cost, address owner) {
        bytes32 cID = orderRegistry[_orderID].containerID;
        address containerRegAddr = ContractProvider(cpAddr).contracts("containerReg");
        var (cont_cost, cont_owner) = ContainerRegistry(containerRegAddr).getPaymentInfo(cID);
        return (cont_cost, cont_owner);
    }

    function getSoftwareInfo(bytes32 _orderID) private returns (uint cost, address owner) {
        address softwareRegAddr = ContractProvider(cpAddr).contracts("softwareReg");
        bytes32 swID = orderRegistry[_orderID].softwareID;
        var (sw_cost, sw_owner) = SoftwareRegistry(softwareRegAddr).getPaymentInfo(swID);
        return (sw_cost, sw_owner);
    }

    function fulfillOrder(bytes32 _orderID) onlyIfPlaced(_orderID) public returns (bool res) {
        address ordermanager = ContractProvider(cpAddr).contracts("ordermanager");
        orderM = ordermanager;
        if (ordermanager == 0x0) {
            return false;
        }

        if (msg.sender == ordermanager) {
            var (ds_cost, ds_owner) = getDatasetInfo(_orderID);

            var (sw_cost, sw_owner) = getSoftwareInfo(_orderID);


            var (cont_cost, cont_owner) = getContainerInfo(_orderID);

            ds_owner.transfer(ds_cost);
            sw_owner.transfer(sw_cost);
            cont_owner.transfer(cont_cost);

            orderRegistry[_orderID].status = OrderStatus.SUCCEED;
            return true;
        }
        return false;
    }


    function cancelOrder(bytes32 _orderID) onlyIfPlaced(_orderID) public returns (bool res) {
        address ordermanager = ContractProvider(cpAddr).contracts("ordermanager");
        if (ordermanager == 0x0) {
            return false;
        }

        if (msg.sender == ordermanager) {
            orderRegistry[_orderID].status = OrderStatus.CANCELLED;
            orderRegistry[_orderID].buyer.transfer(orderRegistry[_orderID].amount);
            return true;
        }
        return false;
    }

    function() public payable {}
}






