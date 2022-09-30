// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Roles.sol";
import "../utils/Context.sol";

// Define a contract 'ProcessorRole' to manage this role - add, remove, check
contract ProcessorRole is Context {
    using Roles for Roles.Role;

    // Define 2 events, one for Adding, and other for Removing
    event ProcessorAdded(address indexed account);
    event ProcessorRemoved(address indexed account);

    // Define a struct 'processors' by inheriting from 'Roles' library, struct Role
    Roles.Role private processors;

    // In the constructor make the address that deploys this contract the 1st processor
    constructor() public {
        _addProcessor(_msgSender());
    }

    // Define a modifier that checks to see if _msgSender() has the appropriate role
    modifier onlyProcessor() {
        require(isProcessor(_msgSender()));
        _;
    }

    // Define a function 'isProcessor' to check this role
    function isProcessor(address account) public view returns (bool) {
        return processors.has(account);
    }

    // Define a function 'addProcessor' that adds this role
    function addProcessor(address account) public onlyProcessor {
        _addProcessor(account);
    }

    // Define a function 'renounceProcessor' to renounce this role
    function renounceProcessor() public {
        _removeProcessor(_msgSender());
    }

    // Define an internal function '_addProcessor' to add this role, called by 'addProcessor'
    function _addProcessor(address account) internal {
        processors.add(account);
        emit ProcessorAdded(account);
    }

    // Define an internal function '_removeProcessor' to remove this role, called by 'removeProcessor'
    function _removeProcessor(address account) internal {
        processors.remove(account);
        emit ProcessorRemoved(account);
    }
}
