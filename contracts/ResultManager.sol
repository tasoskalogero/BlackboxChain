pragma solidity ^0.4.19;

import "./ResultRegistry.sol";

contract ResultManager {

    address oracleAddress;

    event ResultAdded (
        bytes32 result,
        address owner
    );

    event ResultError(bytes32 errorMsg);

    ResultRegistry resultRegistry;

    modifier onlyOracle {
        require(msg.sender == oracleAddress);
        _;
    }

    function ResultManager(address _resultRegistryAddress, address _oracle) public {
        oracleAddress = _oracle;
        resultRegistry = ResultRegistry(_resultRegistryAddress);
    }

    function addResultInfo(address _owner, bytes32 _newResult) onlyOracle public returns(bool success) {
        bool res = resultRegistry.addResult(_owner, _newResult);
        if(res) {
            ResultAdded(_newResult, _owner);
            return true;
        }
        return false;
    }

    /*
    * Throw error event in case of computation error.
    * @param the error message
    */
    function resultError(bytes32 _errorMsg) onlyOracle public  {
        ResultError(_errorMsg);
    }
}
