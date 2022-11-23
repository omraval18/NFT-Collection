const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require("../constants");

async function main() {
    const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
    const metadataURL = METADATA_URL;
    
    // CALL CONTRACT
    const cryptoContract = await ethers.getContractFactory("CryptoDev");
// DEPLOY IT
    const deployedContract = await cryptoContract.deploy(metadataURL, WHITELIST_CONTRACT_ADDRESS);
// GET CONTRACT ADDRESS
  
    console.log("Contract Address :", deployedContract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(0);
    });
