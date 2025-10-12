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
  Shield,
  CheckCircle,
  XCircle,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { useAccount } from "wagmi";
import { useSupplyChain } from "@/hooks/useSupplyChain";
import { USER_ROLES } from "@/lib/contracts-wagmi";

export function UserVerification() {
  const { address } = useAccount();
  const { role, verifyUser, unverifyUser } = useSupplyChain();
  const [userAddress, setUserAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleVerifyUser = async () => {
    if (!userAddress) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      verifyUser(userAddress as `0x${string}`);
      setSuccess(`User ${userAddress} verification initiated!`);
      setUserAddress("");
    } catch (error) {
      console.error("Verification failed:", error);
      setError(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnverifyUser = async () => {
    if (!userAddress) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      unverifyUser(userAddress as `0x${string}`);
      setSuccess(`User ${userAddress} unverification initiated!`);
      setUserAddress("");
    } catch (error) {
      console.error("Unverification failed:", error);
      setError(
        error instanceof Error ? error.message : "Unverification failed"
      );
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
          Only the contract owner can verify users. Connect with the owner
          account to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>User Verification</span>
        </CardTitle>
        <CardDescription>
          Verify or unverify users for the supply chain system.
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

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={handleVerifyUser}
            disabled={isLoading || !userAddress}
            className="flex-1"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Verify User
          </Button>

          <Button
            variant="outline"
            onClick={handleUnverifyUser}
            disabled={isLoading || !userAddress}
            className="flex-1"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Unverify User
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
            <strong>Note:</strong> Users must be verified before they can create
            products.
          </p>
          <p>
            <strong>Process:</strong> Add user role → Verify user → User can
            create products
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
