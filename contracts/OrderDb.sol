pragma solidity ^0.4.17;

/*
* Storage of computation orders.
* Managed by the OrderManager contract.
*/

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
    function contracts(bytes32) public returns (address) {}
}

contract OrderDb {
    address cmAddr;                 // ContractManager address
    bytes32[] public orderIDs;

    event OrderPlaced (
        bytes32 indexed orderID,
        bytes32 indexed containerID,
        bytes32 indexed datasetID,
        bytes32 softwareID
    );

    modifier onlyIfPlaced(bytes32 orderID) {
        require(orderRegistry[orderID].status == OrderStatus.PLACED);
        _;
    }

    enum OrderStatus {PLACED, SUCCEED, CANCELLED}

    struct OrderInfo {
        bytes32 orderID;
        bytes32 containerID;
        bytes32 datasetID;
        bytes32 softwareID;
        address buyer;
        uint amount;
        OrderStatus status;
    }
    //order id to OrderInfo
    mapping(bytes32 => OrderInfo) public orderRegistry;


    function OrderDb(address contractManagerAddr) {
        cmAddr = contractManagerAddr;
    }

    //@param container id, software id, dataset id and owner of the ordered computation
    function placeOrder(bytes32 _containerID, bytes32 _datasetID, bytes32 _softwareID, address _fromAddr) public payable returns (bool res) {
        address ordermanager = ContractProvider(cmAddr).contracts("ordermanager");

        // If OrderManager contract is not available return error
        if (ordermanager == 0x0) {
            msg.sender.transfer(msg.value);
            return false;
        }

        // Accept calls only by the OrderManager contract
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

            //notify
            OrderPlaced(newOrderID, _containerID, _datasetID, _softwareID);
            return true;
        }
        // placing the order failed, return funds to owner
        msg.sender.transfer(msg.value);
        return false;
    }


    /*
    * Get information about the dataset stored in an order.
    * @param order id
    * return dataset cost and owner
    */
    function getDatasetInfo(bytes32 _orderID) private returns (uint cost, address owner) {
        bytes32 dsID = orderRegistry[_orderID].datasetID;
        address datasetRegAddr = ContractProvider(cmAddr).contracts("datasetReg");
        var (ds_cost, ds_owner) = DatasetRegistry(datasetRegAddr).getPaymentInfo(dsID);
        return (ds_cost, ds_owner);
    }

    /*
    * Get information about the container stored in an order.
    * @param order id
    * return container cost and owner
    */
    function getContainerInfo(bytes32 _orderID) private returns (uint cost, address owner) {
        bytes32 cID = orderRegistry[_orderID].containerID;
        address containerRegAddr = ContractProvider(cmAddr).contracts("containerReg");
        var (cont_cost, cont_owner) = ContainerRegistry(containerRegAddr).getPaymentInfo(cID);
        return (cont_cost, cont_owner);
    }


    /*
    * Get information about the software stored in an order.
    * @param order id
    * return software cost and owner
    */
    function getSoftwareInfo(bytes32 _orderID) private returns (uint cost, address owner) {
        address softwareRegAddr = ContractProvider(cmAddr).contracts("softwareReg");
        bytes32 swID = orderRegistry[_orderID].softwareID;
        var (sw_cost, sw_owner) = SoftwareRegistry(softwareRegAddr).getPaymentInfo(swID);
        return (sw_cost, sw_owner);
    }


    /*
    * Complete the order by transferring  funds to the providers.
    * @param order id
    */
    function fulfillOrder(bytes32 _orderID) onlyIfPlaced(_orderID) public returns (bool res) {
        address ordermanager = ContractProvider(cmAddr).contracts("ordermanager");
        // If OrderManager contract is not available return error
        if (ordermanager == 0x0) {
            return false;
        }

        // Accept calls only by the OrderManager contract
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


    /*
    * Cancel an already placed order.
    * @param order id
    */
    function cancelOrder(bytes32 _orderID) onlyIfPlaced(_orderID) public returns (bool res) {
        address ordermanager = ContractProvider(cmAddr).contracts("ordermanager");

        // If OrderManager contract is not available return error
        if (ordermanager == 0x0) {
            return false;
        }

        // Accept calls only by the OrderManager contract
        if (msg.sender == ordermanager) {
            orderRegistry[_orderID].status = OrderStatus.CANCELLED;
            orderRegistry[_orderID].buyer.transfer(orderRegistry[_orderID].amount);
            return true;
        }
        return false;
    }

    // fallback function
    function() public payable {}
}






