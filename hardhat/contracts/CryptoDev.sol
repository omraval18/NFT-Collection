pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDev is ERC721Enumerable, Ownable {
    string _baseTokenURI;
    uint public _price = 0.001 ether;
    bool public _paused;
    uint public _maxTokenIds= 20;
    uint public tokenIds;
    IWhitelist whitelist;

    bool public presaleStarted;
    uint public presaleEnded;

    modifier onlyWhenNotPaused {
        require(!_paused,"Contract currently Paused");
        _;
    }

    constructor (string memory baseURI,address whitelistContract) ERC721("CryptoDevs","CD"){
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);

    }

    function startPresale() public onlyOwner{
        presaleStarted = true;
        presaleEnded= block.timestamp + 10 minutes;


    }
    function presaleMint() public payable onlyWhenNotPaused{

        require(presaleStarted && block.timestamp < presaleEnded,"Presale is not running");
        require(whitelist.whitelistAddresses(msg.sender),"You're not whitelisted");
        require(tokenIds < _maxTokenIds,"Exceeded Maximum Supply");
        require(msg.value >= _price,"Value is too Low to purchase!");
        tokenIds+=1;

        _safeMint(msg.sender,tokenIds);

    }

    function mint() public payable onlyWhenNotPaused{

        require(presaleStarted && block.timestamp >= presaleEnded,"Presale has not ended Yet!");
        require(tokenIds < _maxTokenIds,"Exceeded Maximum Supply");
        require(msg.value >= _price,"Value is too Low to purchase!");
        tokenIds+=1;

        _safeMint(msg.sender,tokenIds);

    }

    function _baseURI() internal view virtual override returns(string memory){
        return _baseTokenURI ;
    }

    function setPaused(bool value) public onlyOwner{
        _paused=value;
    }

    function withdraw() public payable{
        address _owner = owner();
        uint amount = address(this).balance;
        (bool sent,)=_owner.call{value:amount}("");
        require(sent,"Failed to send ethers");


    }

    receive() external payable{}
    fallback() external payable{}





    

}