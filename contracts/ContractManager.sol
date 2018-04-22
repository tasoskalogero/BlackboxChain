pragma solidity ^0.4.17;

/*
* Contract Managing Contact to keep track of all the contracts of the system.
*/

contract ContractManager {
	
	address oracle;

	modifier onlyOracle {
		require(msg.sender == oracle); 
			_;
	}
	// Contract name to contact address on the network
	mapping(bytes32 => address) public contracts;

	function ContractManager() {
		oracle = 0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE; 		// web3.eth.accounts[9]
	}

	//@param name of the contract, address of the deployed contract
	function addContract(bytes32 name, address addr) onlyOracle public {
		contracts[name] = addr;
	}

	//@param name of the contract
	//@return address of the deployed contract
	function getContract(bytes32 name) public view returns(address addr) {
		return contracts[name];
	}

}