pragma solidity ^0.4.19;

/*
* Storage of computation results.
* Accepts calls only from OrderManager contract.
*/

contract ResultRegistry {

    struct ResultStruct {
        bytes32[] results;
    }

    modifier onlyIfAllowed () {
        require(accessAllowed[msg.sender] == true);
        _;
    }

    //owner address to ResultStruct
    mapping(address => ResultStruct) resultRegistry;

    mapping(address => bool) public accessAllowed;

    function ResultRegistry() public {
        accessAllowed[msg.sender] = true;
    }

    function allowAccess(address _address) onlyIfAllowed public {
        accessAllowed[_address] = true;
    }

    /*
    * Add a new result for a specific owner.
    * @param owner of the result, ipfs hash of result
    */
    function addResult(address _owner, bytes32 _newResult) onlyIfAllowed public returns(bool){
        resultRegistry[_owner].results.push(_newResult);
        return true;
    }

    function getResultsByAddress(address owner) public view returns(bytes32[]) {
        require(msg.sender == owner);
        return resultRegistry[owner].results;
    }
}
