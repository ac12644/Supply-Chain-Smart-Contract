"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Wallet,
  User,
  Shield,
  AlertCircle,
  Copy,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { useSupplyChain } from "@/hooks/useSupplyChain";
import { USER_ROLES } from "@/lib/contracts-wagmi";

export function WalletConnectWagmi() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { role, isVerified } = useSupplyChain();
  const [copied, setCopied] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case USER_ROLES.FARMER:
        return "bg-green-100 text-green-800 border-green-200";
      case USER_ROLES.DISTRIBUTOR:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case USER_ROLES.RETAILER:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case USER_ROLES.CONSUMER:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case USER_ROLES.OWNER:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getReputationLevel = (score: number) => {
    if (score >= 800) return { level: "Excellent", color: "text-green-600" };
    if (score >= 600) return { level: "Good", color: "text-blue-600" };
    if (score >= 400) return { level: "Fair", color: "text-yellow-600" };
    if (score >= 200) return { level: "Poor", color: "text-orange-600" };
    return { level: "Very Poor", color: "text-red-600" };
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Connect Wallet</span>
          </CardTitle>
          <CardDescription>
            Connect your wallet to access the AgriChain platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              onClick={() => connect({ connector })}
              disabled={isPending}
              className="w-full"
            >
              {isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Wallet className="h-4 w-4 mr-2" />
              )}
              Connect {connector.name}
            </Button>
          ))}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Make sure you're connected to Polygon Amoy testnet
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Wallet Connected</span>
        </CardTitle>
        <CardDescription>Your wallet is connected to AgriChain</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {formatAddress(address!)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(address!)}
              className="h-6 w-6 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
            {copied && <span className="text-xs text-green-600">Copied!</span>}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              window.open(
                `https://amoy.polygonscan.com/address/${address}`,
                "_blank"
              )
            }
            className="h-6 w-6 p-0"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

        {/* Role */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className={getRoleBadgeClass(role)}>
              {role}
            </Badge>
          </div>
        </div>

        {/* Verification Status */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Verification: {isVerified ? "Verified" : "Not Verified"}
            </span>
            {isVerified ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
          </div>
        </div>

        {/* Network Status */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">
              Polygon Amoy Testnet
            </span>
          </div>
        </div>

        {/* Disconnect Button */}
        <Button
          variant="outline"
          onClick={() => disconnect()}
          className="w-full"
        >
          Disconnect Wallet
        </Button>
      </CardContent>
    </Card>
  );
}
