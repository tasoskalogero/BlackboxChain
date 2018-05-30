pragma solidity ^0.4.19;
/*
* The ResultManager contract.
* Contains the logic for the ResultRegistry contract.
*/
import "./ResultRegistry.sol";

contract ResultManager {

    address oracleAddress;          // address of trusted third-party

    // event for new result
    event ResultAdded (
        bytes32 resultData,         // IPFS address of the computation output
        bytes32 password,           // IPFS address of the one-time password to decrypt the result
        address owner               // address of the recipient
    );

    // event in case of a failure
    event ResultError(bytes32 errorMsg);

    ResultRegistry resultRegistry;          // address of the ResultRegistry contract

    function ResultManager(address _resultRegistryAddress, address _oracle) public {
        oracleAddress = _oracle;
        resultRegistry = ResultRegistry(_resultRegistryAddress);
    }

    // call ResultRegistry contract to add a new result
    function addResultInfo(address _owner, bytes32 _newResultData, bytes32 _newPassword) onlyOracle public returns(bool success) {
        bool res = resultRegistry.addResult(_owner, _newResultData, _newPassword);
        if(res) {
            ResultAdded(_newResultData, _newPassword, _owner);      // trigger event for success
            return true;
        }
        return false;
    }

    // trigger event in case of error in the execution
    function resultError(bytes32 _errorMsg) onlyOracle public  {
        ResultError(_errorMsg);                 // trigger event fo error
    }

    modifier onlyOracle {
        require(msg.sender == oracleAddress);
        _;
    }
}
