// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "../utils/Context.sol";

// By default, the owner account will be the one that deploys the contract.
// This * can later be changed with {transferOwnership}.

contract Ownable is Context {
    address private _owner;

    // Define an Event
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /// Assign the contract to an owner
    constructor() {
        _transferOwnership(_msgSender());
    }

    /// Look up the address of the owner
    function ownerLookup() public view returns (address) {
        return _owner;
    }

    /// Define a function modifier 'onlyOwner'
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    //   Returns the address of the current owner.
    function isOwner() public view virtual returns (address) {
        return _owner;
    }

    /// Check if the calling address is the owner of the contract
    function _checkOwner() internal view virtual {
        require(_msgSender() == isOwner(), "Ownable: caller is not the owner");
    }

    /// Define a function to renounce ownerhip
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /// Define a public function to transfer ownership
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        _transferOwnership(newOwner);
    }

    /// Define an internal function to transfer ownership
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
