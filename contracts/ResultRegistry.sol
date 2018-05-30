pragma solidity ^0.4.19;
/*
* The ResultRegistry contract.
* Store computation results.
*/
contract ResultRegistry {

    // Result data structure
    struct ResultInfo {
        bytes32 resultData;         // IPFS address of computation output
        bytes32 password;           // IPFS address of one-time-password to decrypt the result
    }

    // array of results
    struct ResultStruct {
        ResultInfo[] results;
        uint count;
    }

    mapping(address => ResultStruct) addressToResult;
    mapping(address => bool) accessAllowed;

    function ResultRegistry() public {
        accessAllowed[msg.sender] = true;
    }

    // allow an address to access contract's methods
    function allowAccess(address _address) onlyIfAllowed public {
        accessAllowed[_address] = true;
    }

    // ResultManager contract calls this method to add a new result
    function addResult(address _owner, bytes32 _newResultData, bytes32 _newPassword) onlyIfAllowed public returns(bool){

        addressToResult[_owner].results.push(ResultInfo(_newResultData, _newPassword));
        addressToResult[_owner].count = addressToResult[_owner].count + 1;
        return true;
    }

    modifier onlyIfAllowed () {
        require(accessAllowed[msg.sender] == true);
        _;
    }

    // returns the a specific result from the given address
    function getResult(address owner, uint index) public view returns(bytes32, bytes32) {
        require(msg.sender == owner);
        return (addressToResult[owner].results[index].resultData, addressToResult[owner].results[index].password);
    }

    // returns the number of results of the given address
    function getResultCount(address owner) public view returns(uint) {
        require(msg.sender == owner);
        return addressToResult[owner].count;
    }
}
