pragma solidity ^0.4.18;

contract ResultRegistry {

    address ORACLE = 0x5aeda56215b167893e80b4fe645ba6d5bab767de;

    struct ResultStruct {
        bytes32[] results;
    }

    event ResultAdded (
        bytes32 result,
        address owner
    );

    event ResultError(bytes32 errorMsg);

    mapping(address => ResultStruct) resultRegistry;


    function addNewResult(address _owner, bytes32 _newResult) public returns(bool){
        require(msg.sender == ORACLE);

        resultRegistry[_owner].results.push(_newResult);
        ResultAdded(_newResult, _owner);
        return true;
    }

    function getResultsByAddress(address owner) public view returns(bytes32[]) {
        require(msg.sender == owner);

        return resultRegistry[owner].results;
    }


    function errorInResult(bytes32 _errorMsg) public  {
        require(msg.sender == ORACLE);
        ResultError(_errorMsg);
    }
}
