
let errorCodes = [300,404,409,500,600,610,620,630,640,650];

let errorMessages = {};
errorMessages[300] = "[Oracle] - Invalid BigchainDB transaction IDs";
errorMessages[404] = "Cannot create exec instance.";
errorMessages[409] = "Container is stopped or paused.";
errorMessages[500] = "Server error";
errorMessages[600] = "Error fetching dataset file. Aborting.";
errorMessages[610] = "Error decrypting user data. Aborting.";
errorMessages[620] = "Error fetching sofwtare in container. Aborting.";
errorMessages[630] = "Error executing sofwtare in container. Aborting.";
errorMessages[640] = "Error encrypting result. Aborting.";
errorMessages[650] = "Error writting result on IPFS. Aborting.";


module.exports = {
    getErrorMessage: function(code) {
        return errorMessages[code];
    },
    getErrorCodes: function() {
        return errorCodes;
    }
};