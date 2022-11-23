require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const QUICKNODE_HTTP_URL = process.env.QUICKNODE_HTTP_PROVIDER;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
    solidity: "0.8.9",
    networks: {
        goerli: {
            url: `https://responsive-proud-diamond.ethereum-goerli.discover.quiknode.pro/7dcd4c4ae11657a1a1c0970851b5eb0b1c171faf/`,
            accounts: [PRIVATE_KEY],
        },
    },
};
