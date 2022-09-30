// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Roles.sol";
import "../utils/Context.sol";

// Define a contract 'CifRole' to manage this role - add, remove, check
contract CifRole is Context {
    using Roles for Roles.Role;

    // Define 2 events, one for Adding, and other for Removing
    event CifAdded(address indexed account);
    event CifRemoved(address indexed account);

    // Define a struct 'cifs' by inheriting from 'Roles' library, struct Role
    Roles.Role private cifs;

    // In the constructor make the address that deploys this contract the 1st cif
    constructor() public {
        _addCif(_msgSender());
    }

    // Define a modifier that checks to see if _msgSender() has the appropriate role
    modifier onlyCif() {
        require(isCif(_msgSender()));
        _;
    }

    // Define a function 'isCif' to check this role
    function isCif(address account) public view returns (bool) {
        return cifs.has(account);
    }

    // Define a function 'addCif' that adds this role
    function addCif(address account) public onlyCif {
        _addCif(account);
    }

    // Define a function 'renounceCif' to renounce this role
    function renounceCif() public {
        _removeCif(_msgSender());
    }

    // Define an internal function '_addCif' to add this role, called by 'addCif'
    function _addCif(address account) internal {
        cifs.add(account);
        emit CifAdded(account);
    }

    // Define an internal function '_removeCif' to remove this role, called by 'removeCif'
    function _removeCif(address account) internal {
        cifs.remove(account);
        emit CifRemoved(account);
    }
}
