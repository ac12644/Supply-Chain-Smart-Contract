// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Roles.sol";
import "../utils/Context.sol";

// Define a contract 'FarmerRole' to manage this role - add, remove, check
contract FarmerRole is Context {
    using Roles for Roles.Role;

    // Define 2 events, one for Adding, and other for Removing
    event FarmerAdded(address indexed account);
    event FarmerRemoved(address indexed account);

    // Define a struct 'farmers' by inheriting from 'Roles' library, struct Role
    Roles.Role private farmers;

    // In the constructor make the address that deploys this contract the 1st farmer
    constructor() public {
        _addFarmer(_msgSender());
    }

    // Define a modifier that checks to see if _msgSender() has the appropriate role
    modifier onlyFarmer() {
        require(isFarmer(_msgSender()));
        _;
    }

    // Define a function 'isFarmer' to check this role
    function isFarmer(address account) public view returns (bool) {
        return farmers.has(account);
    }

    // Define a function 'addFarmer' that adds this role
    function addFarmer(address account) public onlyFarmer {
        _addFarmer(account);
    }

    // Define a function 'renounceFarmer' to renounce this role
    function renounceFarmer() public {
        _removeFarmer(_msgSender());
    }

    // Define an internal function '_addFarmer' to add this role, called by 'addFarmer'
    function _addFarmer(address account) internal {
        farmers.add(account);
        emit FarmerAdded(account);
    }

    // Define an internal function '_removeFarmer' to remove this role, called by 'removeFarmer'
    function _removeFarmer(address account) internal {
        farmers.remove(account);
        emit FarmerRemoved(account);
    }
}
