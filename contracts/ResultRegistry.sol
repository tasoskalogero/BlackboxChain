pragma solidity ^0.4.18;

/*
* Storage of computation results.
* Accepts calls only from OrderManager contract.
*/

contract ResultRegistry {
    address oracle;

    event ResultAdded (
        bytes32 result,
        address owner
    );
    event ResultError(bytes32 errorMsg);

    modifier onlyOracle {
        require(msg.sender == oracle);
        _;
    }

    struct ResultStruct {
        bytes32[] results;
    }
    //owner address to ResultStruct
    mapping(address => ResultStruct) resultRegistry;

    function ResultRegistry() {
        oracle = 0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE; 		 // web3.eth.accounts[9]
    }

    /*
    * Add a new result for a specific owner.
    * @param owner of the result, ipfs hash of result
    */
    function addNewResult(address _owner, bytes32 _newResult) onlyOracle public returns(bool){
        resultRegistry[_owner].results.push(_newResult);
        ResultAdded(_newResult, _owner);
        return true;
    }

    function getResultsByAddress(address owner) public view returns(bytes32[]) {
        require(msg.sender == owner);
        return resultRegistry[owner].results;
    }

    /*
    * Throw error event in case of computation error.
    * @param the error message
    */
    function errorInResult(bytes32 _errorMsg) onlyOracle public  {
        ResultError(_errorMsg);
    }
}
