// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Roles.sol";
import "../utils/Context.sol";

// Define a contract 'PackerRole' to manage this role - add, remove, check
contract PackerRole is Context {
    using Roles for Roles.Role;

    // Define 2 events, one for Adding, and other for Removing
    event PackerAdded(address indexed account);
    event PackerRemoved(address indexed account);

    // Define a struct 'farmers' by inheriting from 'Roles' library, struct Role
    Roles.Role private packers;

    // In the constructor make the address that deploys this contract the 1st farmer
    constructor() public {
        _addPacker(_msgSender());
    }

    // Define a modifier that checks to see if _msgSender() has the appropriate role
    modifier onlyPacker() {
        require(isPacker(_msgSender()));
        _;
    }

    // Define a function 'isFarmer' to check this role
    function isPacker(address account) public view returns (bool) {
        return packers.has(account);
    }

    // Define a function 'addFarmer' that adds this role
    function addPacker(address account) public onlyPacker {
        _addPacker(account);
    }

    // Define a function 'renounceFarmer' to renounce this role
    function renouncePacker() public {
        _removePacker(_msgSender());
    }

    // Define an internal function '_addFarmer' to add this role, called by 'addFarmer'
    function _addPacker(address account) internal {
        packers.add(account);
        emit PackerAdded(account);
    }

    // Define an internal function '_removeFarmer' to remove this role, called by 'removeFarmer'
    function _removePacker(address account) internal {
        packers.remove(account);
        emit PackerRemoved(account);
    }
}
