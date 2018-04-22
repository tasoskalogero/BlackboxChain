pragma solidity ^0.4.17;

/*
* Manages computations orders by calling OrderDb contract.
*/


contract ContractProvider {
    function contracts(bytes32) public returns (address) {}
}

contract OrderDb {
	function placeOrder(bytes32, bytes32, bytes32, address) public payable returns(bool) {}
	function fulfillOrder(bytes32) public returns(bool) {}
	function cancelOrder(bytes32) public returns(bool) {}
}

contract OrderManager {
	address public oracle;
	address public cpAddr;
    address public orderDB;

	event ZeroFunds();
	event OrderDbNotAvailable();
	event OrderManagerPlaceOrderFailed();
	event OrderCancelled();
	event OrderCancelFailed();
	event FulfillOrderFailed();
	event OrderFulfilled();

	modifier onlyOracle {
		require(msg.sender == oracle);
			_;
	}

	function OrderManager(address contractProviderAddr) {
		oracle = 0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE; 		// web3.eth.accounts[9]
		cpAddr = contractProviderAddr;
	}

    //@param container id, software id, dataset id and owner of the ordered computation
	function placeOrder(bytes32 _containerID, bytes32 _datasetID, bytes32 _softwareID) payable returns(bool res) {
		if(msg.value == 0) {
			ZeroFunds();
			return false;
		}

		address orderdb = ContractProvider(cpAddr).contracts("orderdb");
        // If OrderDb contract is not available return error
		if(orderdb == 0x0) {
			msg.sender.transfer(msg.value);
			OrderDbNotAvailable();
			return false;
		}

        // Call the OrderDb function
		bool success = OrderDb(orderdb).placeOrder.value(msg.value)(_containerID,_datasetID, _softwareID, msg.sender);
		if(!success) {
			msg.sender.transfer(msg.value);
			OrderManagerPlaceOrderFailed();
			return false;
		}
		return true;
	}

    /*
    * Complete the order by calling the fulfillOrder function from OrderDb contract.
    * @param order id
    */
	function fulfillOrder(bytes32 _orderID) onlyOracle returns (bool res) {
		address orderdb = ContractProvider(cpAddr).contracts("orderdb");
        orderDB = orderdb;

		if(orderdb == 0x0) {
			OrderDbNotAvailable();
			return false;
		}
		bool success = OrderDb(orderdb).fulfillOrder(_orderID);
		if(!success)  {
			FulfillOrderFailed();
			return false;
		}
		OrderFulfilled();
		return true;
	}

    /*
    * Cancel an already placed order by calling the cancelOrder function from OrderDb contract.
    * @param order id
    */
	function cancelOrder(bytes32 _orderID) onlyOracle public returns (bool res) {
		address orderdb = ContractProvider(cpAddr).contracts("orderdb");
        orderDB = orderdb;

        if(orderdb == 0x0) {
			OrderDbNotAvailable();
			return false;
		}

		bool success = OrderDb(orderdb).cancelOrder(_orderID);
		if(!success)  {
			OrderCancelFailed();
			return false;
		}
		OrderCancelled();
		return true;
	}

	function() public payable { }

}