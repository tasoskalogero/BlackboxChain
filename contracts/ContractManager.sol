pragma solidity ^0.4.17;

contract ContractManager {
	
	address oracle;

	modifier onlyOracle {
		require(msg.sender == oracle); 
			_;
	}

	mapping(bytes32 => address) public contracts;

	function ContractManager() {
		oracle = 0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE; 		// web3.eth.accounts[9]
	}

	function addContract(bytes32 name, address addr) onlyOracle public {
		contracts[name] = addr;
	}

	function getContract(bytes32 name) public view returns(address addr) {
		return contracts[name];
	}

}