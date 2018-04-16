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

    mapping(address => ResultStruct) resultRegistry;


    function addNewResult(address owner, bytes32 newResult) public returns(bool){
        require(msg.sender == ORACLE);

        resultRegistry[owner].results.push(newResult);
        ResultAdded(newResult, owner);
        return true;
    }

    function getResultsByAddress(address owner) public view returns(bytes32[]) {
        require(msg.sender == owner);

        return resultRegistry[owner].results;
    }
}
