// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Escrow
 * @dev Escrow contract for handling payments and disputes in supply chain
 */
contract Escrow is ReentrancyGuard, Pausable, Ownable {

    enum DisputeStatus { None, Open, Resolved, Rejected }
    enum Resolution { Seller, Buyer, Split }

    struct EscrowData {
        uint256 productCode;
        address buyer;
        address seller;
        uint256 amount;
        uint256 deadline;
        DisputeStatus disputeStatus;
        address arbitrator;
        bool isReleased;
        bool isRefunded;
    }

    struct Dispute {
        uint256 escrowId;
        address complainant;
        string reason;
        uint256 timestamp;
        Resolution resolution;
        bool isResolved;
    }

    uint256 private _escrowCounter;
    mapping(uint256 => EscrowData) public escrows;
    mapping(uint256 => Dispute) public disputes;
    mapping(address => bool) public arbitrators;
    
    uint256 public constant ARBITRATION_FEE = 0.01 ether;
    uint256 public constant ESCROW_TIMEOUT = 7 days;

    event EscrowCreated(uint256 indexed escrowId, uint256 indexed productCode, address buyer, address seller, uint256 amount);
    event PaymentReleased(uint256 indexed escrowId, address seller, uint256 amount);
    event PaymentRefunded(uint256 indexed escrowId, address buyer, uint256 amount);
    event DisputeOpened(uint256 indexed escrowId, address complainant, string reason);
    event DisputeResolved(uint256 indexed escrowId, Resolution resolution);

    modifier onlyArbitrator() {
        require(arbitrators[msg.sender], "Only arbitrators can perform this action");
        _;
    }

    modifier validEscrow(uint256 escrowId) {
        require(escrowId <= _escrowCounter, "Invalid escrow ID");
        require(!escrows[escrowId].isReleased && !escrows[escrowId].isRefunded, "Escrow already settled");
        _;
    }

    constructor() Ownable(msg.sender) {
        arbitrators[msg.sender] = true; // Owner is initial arbitrator
    }

    function addArbitrator(address arbitrator) external onlyOwner {
        arbitrators[arbitrator] = true;
    }

    function removeArbitrator(address arbitrator) external onlyOwner {
        arbitrators[arbitrator] = false;
    }

    function createEscrow(
        uint256 productCode,
        address buyer,
        address seller,
        uint256 deadline
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        require(msg.value > 0, "Amount must be greater than zero");
        require(buyer != address(0) && seller != address(0), "Invalid addresses");
        require(deadline > block.timestamp, "Deadline must be in the future");

        _escrowCounter++;
        uint256 escrowId = _escrowCounter;

        escrows[escrowId] = EscrowData({
            productCode: productCode,
            buyer: buyer,
            seller: seller,
            amount: msg.value,
            deadline: deadline,
            disputeStatus: DisputeStatus.None,
            arbitrator: address(0),
            isReleased: false,
            isRefunded: false
        });

        emit EscrowCreated(escrowId, productCode, buyer, seller, msg.value);
        return escrowId;
    }

    function releasePayment(uint256 escrowId) external nonReentrant validEscrow(escrowId) {
        EscrowData storage escrow = escrows[escrowId];
        require(msg.sender == escrow.buyer, "Only buyer can release payment");
        require(escrow.disputeStatus != DisputeStatus.Open, "Cannot release during dispute");

        escrow.isReleased = true;
        payable(escrow.seller).transfer(escrow.amount);

        emit PaymentReleased(escrowId, escrow.seller, escrow.amount);
    }

    function refundPayment(uint256 escrowId) external nonReentrant validEscrow(escrowId) {
        EscrowData storage escrow = escrows[escrowId];
        require(
            msg.sender == escrow.buyer || 
            msg.sender == escrow.seller || 
            block.timestamp > escrow.deadline,
            "Unauthorized refund"
        );

        escrow.isRefunded = true;
        payable(escrow.buyer).transfer(escrow.amount);

        emit PaymentRefunded(escrowId, escrow.buyer, escrow.amount);
    }

    function openDispute(uint256 escrowId, string memory reason) external payable nonReentrant validEscrow(escrowId) {
        EscrowData storage escrow = escrows[escrowId];
        require(msg.sender == escrow.buyer || msg.sender == escrow.seller, "Unauthorized");
        require(msg.value >= ARBITRATION_FEE, "Insufficient arbitration fee");
        require(escrow.disputeStatus == DisputeStatus.None, "Dispute already exists");

        escrow.disputeStatus = DisputeStatus.Open;
        
        disputes[escrowId] = Dispute({
            escrowId: escrowId,
            complainant: msg.sender,
            reason: reason,
            timestamp: block.timestamp,
            resolution: Resolution.Seller,
            isResolved: false
        });

        emit DisputeOpened(escrowId, msg.sender, reason);
    }

    function resolveDispute(uint256 escrowId, Resolution resolution) external onlyArbitrator nonReentrant {
        EscrowData storage escrow = escrows[escrowId];
        Dispute storage dispute = disputes[escrowId];
        
        require(escrow.disputeStatus == DisputeStatus.Open, "No active dispute");
        require(!dispute.isResolved, "Dispute already resolved");

        dispute.resolution = resolution;
        dispute.isResolved = true;
        escrow.disputeStatus = DisputeStatus.Resolved;

        if (resolution == Resolution.Seller) {
            escrow.isReleased = true;
            payable(escrow.seller).transfer(escrow.amount);
            emit PaymentReleased(escrowId, escrow.seller, escrow.amount);
        } else if (resolution == Resolution.Buyer) {
            escrow.isRefunded = true;
            payable(escrow.buyer).transfer(escrow.amount);
            emit PaymentRefunded(escrowId, escrow.buyer, escrow.amount);
        } else if (resolution == Resolution.Split) {
            uint256 sellerAmount = escrow.amount * 50 / 100;
            uint256 buyerAmount = escrow.amount - sellerAmount;
            
            escrow.isReleased = true;
            escrow.isRefunded = true;
            
            payable(escrow.seller).transfer(sellerAmount);
            payable(escrow.buyer).transfer(buyerAmount);
            
            emit PaymentReleased(escrowId, escrow.seller, sellerAmount);
            emit PaymentRefunded(escrowId, escrow.buyer, buyerAmount);
        }

        emit DisputeResolved(escrowId, resolution);
    }

    function getEscrowData(uint256 escrowId) external view returns (EscrowData memory) {
        return escrows[escrowId];
    }

    function getDisputeData(uint256 escrowId) external view returns (Dispute memory) {
        return disputes[escrowId];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
