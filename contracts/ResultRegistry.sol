pragma solidity ^0.4.19;

/*
* Storage of computation results.
* Accepts calls only from OrderManager contract.
*/

contract ResultRegistry {

    struct ResultInfo {
        bytes32 resultData;
        bytes32 password;
    }

    struct ResultStruct {
        ResultInfo[] results;
        uint count;
    }

    modifier onlyIfAllowed () {
        require(accessAllowed[msg.sender] == true);
        _;
    }

    //owner address to ResultStruct
    mapping(address => ResultStruct) addressToResult;

    mapping(address => bool) accessAllowed;

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
    function addResult(address _owner, bytes32 _newResultData, bytes32 _newPassword) onlyIfAllowed public returns(bool){

        addressToResult[_owner].results.push(ResultInfo(_newResultData, _newPassword));
        addressToResult[_owner].count = addressToResult[_owner].count + 1;
        return true;
    }

    function getResult(address owner, uint index) public view returns(bytes32, bytes32) {
        require(msg.sender == owner);
        return (addressToResult[owner].results[index].resultData, addressToResult[owner].results[index].password);
    }

    function getResultCount(address owner) public view returns(uint) {
        require(msg.sender == owner);
        return addressToResult[owner].count;
    }
}
