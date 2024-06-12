// SPDX-License-Identifier: MIT
pragma solidity 0.8.3;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";


contract MultiSendProxy is OwnableUpgradeable {
  mapping(address => bool) public whitelists;

  modifier onlyWL() {
    require(whitelists[msg.sender], "Invalid sender, must be in whitelist");
    _;
  }

  function initialize(address[] memory listWhitelist) public initializer {
    __Ownable_init();
    whitelists[msg.sender] = true;
    for (uint256 i = 0; i < listWhitelist.length; i++) {
      whitelists[listWhitelist[i]] = true; 
    }
  }

  function setWhitelist(address user, bool status) public onlyOwner {
    whitelists[user] = status;
  }



  function multisend(address[] memory targets, uint256[] memory amounts, bytes[] memory data) external onlyWL returns (uint256 revertIndex) {
    uint256 targetsLength = targets.length;
    require(targetsLength == amounts.length && targetsLength == data.length, "Invalid input");

    for (uint256 i = 0; i < targetsLength; i++) {
      (bool success, bytes memory edata) = targets[i].call{value: amounts[i]}(data[i]);
      revertIndex = i;
      require(success, "Failed");
    }
    return revertIndex;
  }
}
