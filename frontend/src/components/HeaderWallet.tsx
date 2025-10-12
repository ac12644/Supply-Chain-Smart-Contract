"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Wallet,
  User,
  Shield,
  AlertCircle,
  Copy,
  ExternalLink,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { useSupplyChain } from "@/hooks/useSupplyChain";
import { USER_ROLES } from "@/lib/contracts-wagmi";

export function HeaderWallet() {
  const { address, isConnected, status } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { role, isVerified } = useSupplyChain();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleConnect = async (connector: any) => {
    try {
      setError(null);
      await connect({ connector });
    } catch (err) {
      console.error("Connection failed:", err);
      setError(err instanceof Error ? err.message : "Connection failed");
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

  if (!isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Wallet className="h-4 w-4" />
            <span>Connect</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Connect Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {connectors.length === 0 ? (
            <DropdownMenuItem
              disabled
              className="text-xs text-muted-foreground"
            >
              <AlertCircle className="h-3 w-3 mr-2" />
              No wallet connectors available
            </DropdownMenuItem>
          ) : (
            connectors.map((connector) => (
              <DropdownMenuItem
                key={connector.uid}
                onClick={() => handleConnect(connector)}
                disabled={isPending}
              >
                {isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                ) : (
                  <Wallet className="h-4 w-4 mr-2" />
                )}
                {connector.name}
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3 mr-2" />
            Connect to Polygon Amoy testnet
          </DropdownMenuItem>
          {(error || connectError) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="text-xs text-red-600">
                <AlertCircle className="h-3 w-3 mr-2" />
                {error || connectError?.message || "Connection failed"}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="font-mono text-xs">{formatAddress(address!)}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span className="font-mono text-xs">{address}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Role */}
        <DropdownMenuItem disabled className="flex items-center space-x-2">
          <Shield className="h-4 w-4" />
          <Badge variant="outline" className={getRoleBadgeClass(role)}>
            {role}
          </Badge>
        </DropdownMenuItem>

        {/* Verification Status */}
        <DropdownMenuItem disabled className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">
            {isVerified ? "Verified" : "Not Verified"}
          </span>
          {isVerified ? (
            <CheckCircle className="h-3 w-3 text-green-600" />
          ) : (
            <AlertCircle className="h-3 w-3 text-red-600" />
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Actions */}
        <DropdownMenuItem onClick={() => copyToClipboard(address!)}>
          <Copy className="h-4 w-4 mr-2" />
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            window.open(
              `https://amoy.polygonscan.com/address/${address}`,
              "_blank"
            )
          }
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View on Polygonscan
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => disconnect()} className="text-red-600">
          <Wallet className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
