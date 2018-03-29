pragma solidity ^0.4.18;

contract Payment {

    function payment(address dsAddr, address contAddr,bytes32 dsID, bytes32 containerID) public payable returns(uint){
        DatasetRepository dsRepo = DatasetRepository(dsAddr);
        ContainerReposigory containerRepo = ContainerReposigory(contAddr);
        var (dsCost, dsOwner) = dsRepo.getDatasetPurchaseInfoByID(dsID);
        var (contCost, contOwner) = containerRepo.getContainerPurchaseInfoByID(containerID); //TODO get from BDB
        contOwner.transfer(msg.value - dsCost);
        dsOwner.transfer(msg.value - contCost);
        return contCost + dsCost;
    }
}

contract DatasetRepository {
    function getDatasetPurchaseInfoByID(bytes32 _id) returns(uint, address);
}

contract ContainerReposigory{
    function getContainerPurchaseInfoByID(bytes32 _id)returns(uint, address);
}
