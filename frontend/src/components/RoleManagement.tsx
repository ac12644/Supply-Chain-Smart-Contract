"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  UserMinus,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAccount } from "wagmi";
import { useSupplyChain } from "@/hooks/useSupplyChain";
import { USER_ROLES } from "@/lib/contracts-wagmi";

export function RoleManagement() {
  const { address } = useAccount();
  const { role, addFarmer, addDistributor, addRetailer, addConsumer } =
    useSupplyChain();
  const [userAddress, setUserAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddRole = async (roleType: string) => {
    if (!userAddress) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      switch (roleType) {
        case "farmer":
          addFarmer(userAddress as `0x${string}`);
          break;
        case "distributor":
          addDistributor(userAddress as `0x${string}`);
          break;
        case "retailer":
          addRetailer(userAddress as `0x${string}`);
          break;
        case "consumer":
          addConsumer(userAddress as `0x${string}`);
          break;
        default:
          throw new Error("Invalid role type");
      }

      setSuccess(`User ${userAddress} role addition initiated!`);
      setUserAddress("");
    } catch (error) {
      console.error("Add role failed:", error);
      setError(error instanceof Error ? error.message : "Add role failed");
    } finally {
      setIsLoading(false);
    }
  };

  const isOwner = address && role === USER_ROLES.OWNER;

  if (!isOwner) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Only the contract owner can manage user roles. Connect with the owner
          account to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Role Management</span>
        </CardTitle>
        <CardDescription>
          Add users to different roles in the supply chain system.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Account */}
        <div className="space-y-2">
          <Label>Current Account</Label>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Owner</span>
            </Badge>
            <span className="text-sm font-mono text-muted-foreground">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
        </div>

        {/* User Address Input */}
        <div className="space-y-2">
          <Label htmlFor="userAddress">User Address</Label>
          <Input
            id="userAddress"
            placeholder="0x..."
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
          />
        </div>

        {/* Role Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleAddRole("farmer")}
            disabled={isLoading || !userAddress}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Farmer</span>
          </Button>

          <Button
            onClick={() => handleAddRole("distributor")}
            disabled={isLoading || !userAddress}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Distributor</span>
          </Button>

          <Button
            onClick={() => handleAddRole("retailer")}
            disabled={isLoading || !userAddress}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Retailer</span>
          </Button>

          <Button
            onClick={() => handleAddRole("consumer")}
            disabled={isLoading || !userAddress}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Consumer</span>
          </Button>
        </div>

        {/* Success Message */}
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Note:</strong> Users must have a role before they can be
            verified.
          </p>
          <p>
            <strong>Process:</strong> Add role → Verify user → User can create
            products
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
