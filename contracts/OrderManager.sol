pragma solidity ^0.4.17;

contract ContractProvider {
    function contracts(bytes32 name) public returns (address addr) {}
}

contract OrderDb {
	function placeOrder(bytes32 cID, bytes32 dsID, bytes32 swID, address fromAddr) public payable returns(bool res) {}
	function fulfillOrder(bytes32 orderID) public returns(bool res) {}
	function cancelOrder(bytes32 orderID) public returns(bool res) {}
}

contract OrderManager {
	address oracle;
	address cpAddr;

	event ZeroFunds();
	event OrderDbNotValidAvailable();
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

	//called by any address
	function placeOrder(bytes32 _containerID, bytes32 _datasetID, bytes32 _softwareID) payable returns(bool res) {
		if(msg.value == 0) {
			ZeroFunds();
			return false;
		}

		address orderdb = ContractProvider(cpAddr).contracts("orderdb");
		// orderdb not available
		if(orderdb == 0x0) {
			msg.sender.transfer(msg.value);
			OrderDbNotValidAvailable();
			return false;
		}

		bool success = OrderDb(orderdb).placeOrder.value(msg.value)(_containerID,_datasetID, _softwareID, msg.sender);
		if(!success) {
			msg.sender.transfer(msg.value);
			OrderManagerPlaceOrderFailed();
			return false;
		}
		return true;
	}

	function fulfillOrder(bytes32 _orderID) onlyOracle returns (bool res) {
		address orderdb = ContractProvider(cpAddr).contracts("orderdb");
		if(orderdb == 0x0) {
			OrderDbNotValidAvailable();
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


	function cancelOrder(bytes32 _orderID) onlyOracle returns (bool res) {
		address orderdb = ContractProvider(cpAddr).contracts("orderdb");
		if(orderdb == 0x0) {
			OrderDbNotValidAvailable();
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