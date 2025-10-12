// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Reputation
 * @dev Reputation system for supply chain participants
 */
contract Reputation is Ownable {
    constructor() Ownable(msg.sender) {}

    struct ReputationData {
        uint256 score;
        uint256 totalTransactions;
        uint256 successfulTransactions;
        uint256 failedTransactions;
        uint256 lastUpdate;
        bool isActive;
    }

    struct Review {
        uint256 reviewId;
        address reviewer;
        address reviewee;
        uint256 rating; // 1-5 stars
        string comment;
        uint256 timestamp;
        bool isVerified;
    }

    mapping(address => ReputationData) public reputations;
    mapping(uint256 => Review) public reviews;
    mapping(address => uint256[]) public userReviews;
    
    uint256 private _reviewCounter;
    
    uint256 public constant MAX_SCORE = 1000;
    uint256 public constant MIN_SCORE = 0;
    uint256 public constant MIN_RATING = 1;
    uint256 public constant MAX_RATING = 5;

    event ReputationUpdated(address indexed user, uint256 newScore, uint256 totalTransactions);
    event ReviewAdded(uint256 indexed reviewId, address reviewer, address reviewee, uint256 rating);
    event ReviewVerified(uint256 indexed reviewId, bool verified);

    modifier validRating(uint256 rating) {
        require(rating >= MIN_RATING && rating <= MAX_RATING, "Invalid rating");
        _;
    }

    modifier activeUser(address user) {
        require(reputations[user].isActive, "User not active");
        _;
    }

    function registerUser(address user) external onlyOwner {
        require(!reputations[user].isActive, "User already registered");
        
        reputations[user] = ReputationData({
            score: 500, // Start with neutral score
            totalTransactions: 0,
            successfulTransactions: 0,
            failedTransactions: 0,
            lastUpdate: block.timestamp,
            isActive: true
        });
    }

    function addReview(
        address reviewee,
        uint256 rating,
        string memory comment
    ) external validRating(rating) activeUser(reviewee) returns (uint256) {
        require(msg.sender != reviewee, "Cannot review yourself");
        require(reputations[msg.sender].isActive, "Reviewer not active");

        _reviewCounter++;
        uint256 reviewId = _reviewCounter;

        reviews[reviewId] = Review({
            reviewId: reviewId,
            reviewer: msg.sender,
            reviewee: reviewee,
            rating: rating,
            comment: comment,
            timestamp: block.timestamp,
            isVerified: false
        });

        userReviews[reviewee].push(reviewId);

        emit ReviewAdded(reviewId, msg.sender, reviewee, rating);
        return reviewId;
    }

    function verifyReview(uint256 reviewId) external onlyOwner {
        require(reviewId <= _reviewCounter, "Invalid review ID");
        require(!reviews[reviewId].isVerified, "Review already verified");

        reviews[reviewId].isVerified = true;
        _updateReputation(reviews[reviewId].reviewee, reviews[reviewId].rating);

        emit ReviewVerified(reviewId, true);
    }

    function recordTransactionSuccess(address user) external onlyOwner {
        require(reputations[user].isActive, "User not active");
        
        ReputationData storage rep = reputations[user];
        rep.totalTransactions++;
        rep.successfulTransactions++;
        rep.lastUpdate = block.timestamp;

        // Increase score for successful transaction
        if (rep.score < MAX_SCORE) {
            rep.score = rep.score + 10;
        }

        emit ReputationUpdated(user, rep.score, rep.totalTransactions);
    }

    function recordTransactionFailure(address user) external onlyOwner {
        require(reputations[user].isActive, "User not active");
        
        ReputationData storage rep = reputations[user];
        rep.totalTransactions++;
        rep.failedTransactions++;
        rep.lastUpdate = block.timestamp;

        // Decrease score for failed transaction
        if (rep.score > MIN_SCORE) {
            rep.score = rep.score - 20;
        }

        emit ReputationUpdated(user, rep.score, rep.totalTransactions);
    }

    function _updateReputation(address user, uint256 rating) internal {
        ReputationData storage rep = reputations[user];
        
        // Calculate score change based on rating
        int256 scoreChange;
        if (rating == 5) {
            scoreChange = 20;
        } else if (rating == 4) {
            scoreChange = 10;
        } else if (rating == 3) {
            scoreChange = 0;
        } else if (rating == 2) {
            scoreChange = -10;
        } else if (rating == 1) {
            scoreChange = -20;
        }

        uint256 newScore;
        if (scoreChange > 0) {
            newScore = rep.score + uint256(scoreChange);
            if (newScore > MAX_SCORE) {
                newScore = MAX_SCORE;
            }
        } else {
            if (rep.score >= uint256(-scoreChange)) {
                newScore = rep.score - uint256(-scoreChange);
            } else {
                newScore = MIN_SCORE;
            }
        }

        rep.score = newScore;
        rep.lastUpdate = block.timestamp;

        emit ReputationUpdated(user, newScore, rep.totalTransactions);
    }

    function getUserReputation(address user) external view returns (ReputationData memory) {
        return reputations[user];
    }

    function getUserReviews(address user) external view returns (uint256[] memory) {
        return userReviews[user];
    }

    function getReview(uint256 reviewId) external view returns (Review memory) {
        return reviews[reviewId];
    }

    function calculateReputationLevel(address user) external view returns (string memory) {
        uint256 score = reputations[user].score;
        
        if (score >= 800) {
            return "Excellent";
        } else if (score >= 600) {
            return "Good";
        } else if (score >= 400) {
            return "Average";
        } else if (score >= 200) {
            return "Poor";
        } else {
            return "Very Poor";
        }
    }

    function deactivateUser(address user) external onlyOwner {
        reputations[user].isActive = false;
    }
}
