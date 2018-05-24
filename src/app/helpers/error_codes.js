
let errorCodes = [300,404,409,500,600,610,620,630,640,650];

let errorMessages = {};
errorMessages[300] = "Invalid BigchainDB IDs.";
errorMessages[404] = "Cannot create exec instance.";
errorMessages[409] = "Container is stopped or paused.";
errorMessages[500] = "Server error";
errorMessages[600] = "Error fetching dataset file.";
errorMessages[610] = "Error decrypting user data.";
errorMessages[620] = "Error fetching software.";
errorMessages[630] = "Error executing software.";
errorMessages[640] = "Error encrypting result.";
errorMessages[650] = "Error writing result on IPFS.";
errorMessages[670] = "Error writing password on IPFS.";
errorMessages[660] = "Error decrypting random password.";


module.exports = {
    getErrorMessage: function(code) {
        return errorMessages[code];
    },
    getErrorCodes: function() {
        return errorCodes;
    }
};