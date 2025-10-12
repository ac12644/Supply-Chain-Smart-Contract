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
  Shield,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Gavel,
} from "lucide-react";
import { contractAddresses } from "@/lib/wagmi";
import { escrowAbi } from "@/lib/contracts-wagmi";
import { parseEther, formatEther } from "viem";

export function EscrowTester() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  const [escrowData, setEscrowData] = useState({
    escrowId: "1",
    productCode: "1",
    buyer: "",
    seller: "",
    deadline: "",
    reason: "",
    arbitrator: "",
    resolution: "0", // 0=Seller, 1=Buyer, 2=Split
  });

  const [arbitratorStatus, setArbitratorStatus] = useState<boolean>(false);

  // Check if current user is arbitrator
  const { data: isArbitrator } = useReadContract({
    address: contractAddresses.escrow,
    abi: escrowAbi,
    functionName: "arbitrators",
    args: address ? [address] : undefined,
  });

  // Fetch escrow details
  const { data: escrowDetails } = useReadContract({
    address: contractAddresses.escrow,
    abi: escrowAbi,
    functionName: "escrows",
    args: escrowData.escrowId ? [BigInt(escrowData.escrowId)] : undefined,
  });

  const handleCreateEscrow = () => {
    if (
      !escrowData.productCode ||
      !escrowData.buyer ||
      !escrowData.seller ||
      !escrowData.deadline
    ) {
      alert("Please fill all required fields");
      return;
    }

    const deadline = BigInt(
      Math.floor(new Date(escrowData.deadline).getTime() / 1000)
    );

    writeContract({
      address: contractAddresses.escrow,
      abi: escrowAbi,
      functionName: "createEscrow",
      args: [
        BigInt(escrowData.productCode),
        escrowData.buyer as `0x${string}`,
        escrowData.seller as `0x${string}`,
        deadline,
      ],
      value: parseEther("0.1"), // Example amount
    });
  };

  const handleReleasePayment = () => {
    writeContract({
      address: contractAddresses.escrow,
      abi: escrowAbi,
      functionName: "releasePayment",
      args: [BigInt(escrowData.escrowId)],
    });
  };

  const handleRefundPayment = () => {
    writeContract({
      address: contractAddresses.escrow,
      abi: escrowAbi,
      functionName: "refundPayment",
      args: [BigInt(escrowData.escrowId)],
    });
  };

  const handleOpenDispute = () => {
    if (!escrowData.reason) {
      alert("Please provide a reason for the dispute");
      return;
    }

    writeContract({
      address: contractAddresses.escrow,
      abi: escrowAbi,
      functionName: "openDispute",
      args: [BigInt(escrowData.escrowId), escrowData.reason],
      value: parseEther("0.01"), // Arbitration fee
    });
  };

  const handleResolveDispute = () => {
    writeContract({
      address: contractAddresses.escrow,
      abi: escrowAbi,
      functionName: "resolveDispute",
      args: [BigInt(escrowData.escrowId), Number(escrowData.resolution)],
    });
  };

  const handleAddArbitrator = () => {
    if (!escrowData.arbitrator) {
      alert("Please provide arbitrator address");
      return;
    }

    writeContract({
      address: contractAddresses.escrow,
      abi: escrowAbi,
      functionName: "addArbitrator",
      args: [escrowData.arbitrator as `0x${string}`],
    });
  };

  const getDisputeStatusBadge = (status: number) => {
    const statuses = ["None", "Open", "Resolved", "Rejected"];
    const colors = [
      "bg-gray-100 text-gray-800",
      "bg-yellow-100 text-yellow-800",
      "bg-green-100 text-green-800",
      "bg-red-100 text-red-800",
    ];
    return (
      <Badge className={colors[status] || colors[0]}>
        {statuses[status] || "Unknown"}
      </Badge>
    );
  };

  if (!isConnected) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to test escrow features.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Escrow Contract Tester</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>Escrow System</span>
          </Badge>
          {isArbitrator && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <Gavel className="h-3 w-3" />
              <span>Arbitrator</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Create Escrow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Create Escrow</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="productCode">Product Code</Label>
              <Input
                id="productCode"
                value={escrowData.productCode}
                onChange={(e) =>
                  setEscrowData({ ...escrowData, productCode: e.target.value })
                }
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="buyer">Buyer Address</Label>
              <Input
                id="buyer"
                value={escrowData.buyer}
                onChange={(e) =>
                  setEscrowData({ ...escrowData, buyer: e.target.value })
                }
                placeholder="0x..."
              />
            </div>
            <div>
              <Label htmlFor="seller">Seller Address</Label>
              <Input
                id="seller"
                value={escrowData.seller}
                onChange={(e) =>
                  setEscrowData({ ...escrowData, seller: e.target.value })
                }
                placeholder="0x..."
              />
            </div>
            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={escrowData.deadline}
                onChange={(e) =>
                  setEscrowData({ ...escrowData, deadline: e.target.value })
                }
              />
            </div>
          </div>
          <Button onClick={handleCreateEscrow} className="w-full">
            <DollarSign className="h-4 w-4 mr-2" />
            Create Escrow (0.1 ETH)
          </Button>
        </CardContent>
      </Card>

      {/* Escrow Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Escrow Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="escrowId">Escrow ID</Label>
              <Input
                id="escrowId"
                value={escrowData.escrowId}
                onChange={(e) =>
                  setEscrowData({ ...escrowData, escrowId: e.target.value })
                }
                placeholder="1"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => setEscrowData({ ...escrowData })}
                className="w-full"
              >
                <Clock className="h-4 w-4 mr-2" />
                Refresh Details
              </Button>
            </div>
          </div>

          {/* Escrow Details */}
          {escrowDetails && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold mb-2">Escrow Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Product Code: {escrowDetails[0]?.toString()}</div>
                <div>
                  Amount:{" "}
                  {formatEther((escrowDetails[3] as bigint) || BigInt(0))} ETH
                </div>
                <div>Buyer: {escrowDetails[1]?.slice(0, 10)}...</div>
                <div>Seller: {escrowDetails[2]?.slice(0, 10)}...</div>
                <div>
                  Deadline:{" "}
                  {new Date(
                    Number(escrowDetails[4] as bigint) * 1000
                  ).toLocaleString()}
                </div>
                <div>
                  Dispute Status:{" "}
                  {getDisputeStatusBadge(Number(escrowDetails[5]))}
                </div>
                <div>Released: {escrowDetails[7] ? "Yes" : "No"}</div>
                <div>Refunded: {escrowDetails[8] ? "Yes" : "No"}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button onClick={handleReleasePayment} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Release Payment
            </Button>
            <Button onClick={handleRefundPayment} variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Refund Payment
            </Button>
            <Button onClick={handleOpenDispute} variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Open Dispute
            </Button>
          </div>

          {/* Dispute Reason */}
          <div>
            <Label htmlFor="reason">Dispute Reason</Label>
            <Input
              id="reason"
              value={escrowData.reason}
              onChange={(e) =>
                setEscrowData({ ...escrowData, reason: e.target.value })
              }
              placeholder="Product quality issue..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Arbitration */}
      {(isArbitrator || address === escrowData.arbitrator) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gavel className="h-5 w-5" />
              <span>Arbitration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="arbitrator">Add Arbitrator</Label>
                <Input
                  id="arbitrator"
                  value={escrowData.arbitrator}
                  onChange={(e) =>
                    setEscrowData({ ...escrowData, arbitrator: e.target.value })
                  }
                  placeholder="0x..."
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddArbitrator} className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  Add Arbitrator
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resolution">Resolution</Label>
                <select
                  id="resolution"
                  value={escrowData.resolution}
                  onChange={(e) =>
                    setEscrowData({ ...escrowData, resolution: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="0">Seller Wins</option>
                  <option value="1">Buyer Wins</option>
                  <option value="2">Split</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleResolveDispute} className="w-full">
                  <Gavel className="h-4 w-4 mr-2" />
                  Resolve Dispute
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
