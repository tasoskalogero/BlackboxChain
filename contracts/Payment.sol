pragma solidity ^0.4.18;

contract Payment {

    //TODO check if msg.value === allcosts (sw,ds,container)
    //TODO allow only from oracle - accounts[9]
    function payment(address dsAddr, address contAddr,bytes32 dsID, bytes32 containerID, bytes32 softwareID) public payable returns(uint){
        DatasetRepository dsRepo = DatasetRepository(dsAddr);
        ContainerRepository containerRepo = ContainerRepository(contAddr);
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

contract ContainerRepository{
    function getContainerPurchaseInfoByID(bytes32 _id)returns(uint, address);
}

