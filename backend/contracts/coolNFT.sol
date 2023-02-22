// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract coolNFT is ERC721Enumerable, Ownable {
  string _baseTokenURI;
  uint256 public _price = 0.01 ether;
  bool public _paused;
  uint256 public maxTokenIds = 20;
  uint256 public tokenIds;

  modifier onlyWhenNotPaused {
    require(!_paused, "Contract currently paused");
    _;
  }

  constructor (string memory baseURI) ERC721("coolDAO NFTs", "CDAO") {
    _baseTokenURI = baseURI;
  }

  function mint() public payable onlyWhenNotPaused {
    require(tokenIds < maxTokenIds, "We have sold out of coolDAO NFTs");
    require(msg.value >= _price, "Not enough funds");

    tokenIds += 1;
    _safeMint(msg.sender, tokenIds);
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return _baseTokenURI;
  }

  function setPaused(bool val) public onlyOwner {
    _paused = val;
  }

  function withdrawl() public onlyOwner {
    address _owner = owner();
    uint256 amount = address(this).balance;
    (bool sent, ) = _owner.call{value: amount}("");
    require(sent, "Failed to withdrawl ether");
  }

  // Function to receive Ether. msg.data must be empty
  receive() external payable {}

  // Fallback function is called when msg.data is not empty
  fallback() external payable {}
} 