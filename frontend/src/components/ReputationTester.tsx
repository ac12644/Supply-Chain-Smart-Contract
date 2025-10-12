"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Star,
  User,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Shield,
} from "lucide-react";
import { contractAddresses } from "@/lib/wagmi";
import { reputationAbi } from "@/lib/contracts-wagmi";
import { useSupplyChain } from "@/hooks/useSupplyChain";

export function ReputationTester() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const { role } = useSupplyChain();

  const [reputationData, setReputationData] = useState({
    userAddress: "",
    rating: "5",
    comment: "",
    reviewId: "1",
  });

  // Fetch user reputation
  const { data: userReputation } = useReadContract({
    address: contractAddresses.reputation,
    abi: reputationAbi,
    functionName: "getUserReputation",
    args: reputationData.userAddress
      ? [reputationData.userAddress as `0x${string}`]
      : undefined,
  });

  // Check if user is active
  const { data: isActive } = useReadContract({
    address: contractAddresses.reputation,
    abi: reputationAbi,
    functionName: "activeUsers",
    args: reputationData.userAddress
      ? [reputationData.userAddress as `0x${string}`]
      : undefined,
  });

  // Get reputation level
  const { data: reputationLevel } = useReadContract({
    address: contractAddresses.reputation,
    abi: reputationAbi,
    functionName: "calculateReputationLevel",
    args: reputationData.userAddress
      ? [reputationData.userAddress as `0x${string}`]
      : undefined,
  });

  const handleRegisterUser = () => {
    if (!reputationData.userAddress) {
      alert("Please provide user address");
      return;
    }

    writeContract({
      address: contractAddresses.reputation,
      abi: reputationAbi,
      functionName: "registerUser",
      args: [reputationData.userAddress as `0x${string}`],
    });
  };

  const handleAddReview = () => {
    if (!reputationData.userAddress || !reputationData.comment) {
      alert("Please fill all required fields");
      return;
    }

    writeContract({
      address: contractAddresses.reputation,
      abi: reputationAbi,
      functionName: "addReview",
      args: [
        reputationData.userAddress as `0x${string}`,
        BigInt(parseInt(reputationData.rating)),
        reputationData.comment,
      ],
    });
  };

  const handleVerifyReview = () => {
    if (!reputationData.reviewId) {
      alert("Please provide review ID");
      return;
    }

    writeContract({
      address: contractAddresses.reputation,
      abi: reputationAbi,
      functionName: "verifyReview",
      args: [BigInt(reputationData.reviewId)],
    });
  };

  const handleRecordSuccess = () => {
    if (!reputationData.userAddress) {
      alert("Please provide user address");
      return;
    }

    writeContract({
      address: contractAddresses.reputation,
      abi: reputationAbi,
      functionName: "recordTransactionSuccess",
      args: [reputationData.userAddress as `0x${string}`],
    });
  };

  const handleRecordFailure = () => {
    if (!reputationData.userAddress) {
      alert("Please provide user address");
      return;
    }

    writeContract({
      address: contractAddresses.reputation,
      abi: reputationAbi,
      functionName: "recordTransactionFailure",
      args: [reputationData.userAddress as `0x${string}`],
    });
  };

  const getReputationLevelBadge = (level: string) => {
    const colors = {
      Excellent: "bg-green-100 text-green-800",
      Good: "bg-blue-100 text-blue-800",
      Fair: "bg-yellow-100 text-yellow-800",
      Poor: "bg-red-100 text-red-800",
      Unknown: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge className={colors[level as keyof typeof colors] || colors.Unknown}>
        {level}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (!isConnected) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to test reputation features.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Reputation Contract Tester</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Star className="h-3 w-3" />
            <span>Reputation System</span>
          </Badge>
          {role === "Owner" && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Admin</span>
            </Badge>
          )}
        </div>
      </div>

      {/* User Registration */}
      {role === "Owner" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>User Registration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userAddress">User Address</Label>
                <Input
                  id="userAddress"
                  value={reputationData.userAddress}
                  onChange={(e) =>
                    setReputationData({
                      ...reputationData,
                      userAddress: e.target.value,
                    })
                  }
                  placeholder="0x..."
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleRegisterUser} className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  Register User
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reputation Lookup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Reputation Lookup</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lookupAddress">User Address</Label>
              <Input
                id="lookupAddress"
                value={reputationData.userAddress}
                onChange={(e) =>
                  setReputationData({
                    ...reputationData,
                    userAddress: e.target.value,
                  })
                }
                placeholder="0x..."
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => setReputationData({ ...reputationData })}
                className="w-full"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Lookup Reputation
              </Button>
            </div>
          </div>

          {/* Reputation Details */}
          {userReputation && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold mb-2">Reputation Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Score: {userReputation[0]?.toString()}</div>
                <div>Total Reviews: {userReputation[1]?.toString()}</div>
                <div>
                  Successful Transactions: {userReputation[2]?.toString()}
                </div>
                <div>Failed Transactions: {userReputation[3]?.toString()}</div>
                <div>Active: {userReputation[4] ? "Yes" : "No"}</div>
                <div>
                  Level:{" "}
                  {getReputationLevelBadge(
                    (reputationLevel as string) || "Unknown"
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Review System</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reviewUser">User to Review</Label>
              <Input
                id="reviewUser"
                value={reputationData.userAddress}
                onChange={(e) =>
                  setReputationData({
                    ...reputationData,
                    userAddress: e.target.value,
                  })
                }
                placeholder="0x..."
              />
            </div>
            <div>
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                value={reputationData.rating}
                onChange={(e) =>
                  setReputationData({
                    ...reputationData,
                    rating: e.target.value,
                  })
                }
                placeholder="5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="comment">Comment</Label>
            <Input
              id="comment"
              value={reputationData.comment}
              onChange={(e) =>
                setReputationData({
                  ...reputationData,
                  comment: e.target.value,
                })
              }
              placeholder="Great service, highly recommended!"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm">Rating Preview:</span>
            <div className="flex">
              {renderStars(parseInt(reputationData.rating))}
            </div>
          </div>

          <Button onClick={handleAddReview} className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Review
          </Button>
        </CardContent>
      </Card>

      {/* Admin Functions */}
      {role === "Owner" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Admin Functions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reviewId">Review ID</Label>
                <Input
                  id="reviewId"
                  value={reputationData.reviewId}
                  onChange={(e) =>
                    setReputationData({
                      ...reputationData,
                      reviewId: e.target.value,
                    })
                  }
                  placeholder="1"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleVerifyReview} className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Review
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button onClick={handleRecordSuccess} variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Record Success
              </Button>
              <Button onClick={handleRecordFailure} variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Record Failure
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
