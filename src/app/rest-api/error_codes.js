let errorCodes = {};

errorCodes[300] = "[Oracle] - Invalid BigchainDB transaction IDs";
errorCodes[600] = "Error fetching dataset file. Aborting.";
errorCodes[610] = "Error decrypting user data. Aborting.";
errorCodes[620] = "Error fetching sofwtare in container. Aborting.";
errorCodes[630] = "Error executing sofwtare in container. Aborting.";
errorCodes[640] = "Error encrypting result. Aborting.";
errorCodes[650] = "Error writting result on IPFS. Aborting.";

module.exports = {
    getErrorMessage: function(code) {
        return errorCodes[code];
    }
};