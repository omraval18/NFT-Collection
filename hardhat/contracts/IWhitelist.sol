pragma solidity ^0.8.9;

interface IWhitelist {
    function whitelistAddresses(address) external view returns(bool);
    
}