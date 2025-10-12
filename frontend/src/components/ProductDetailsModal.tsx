"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  Calendar,
  DollarSign,
  User,
  Clock,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { formatEther } from "viem";
import { PRODUCT_STATES } from "@/lib/contracts-wagmi";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: bigint;
  fetchProductDetails: (productCode: bigint) => any;
}

export function ProductDetailsModal({
  isOpen,
  onClose,
  productId,
  fetchProductDetails,
}: ProductDetailsModalProps) {
  const {
    data: productData,
    isLoading,
    error,
  } = fetchProductDetails(productId);

  const formatAddress = (addr: `0x${string}`) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStateBadgeClass = (state: number) => {
    switch (state) {
      case 0:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case 1:
        return "bg-green-100 text-green-800 border-green-200";
      case 2:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 3:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 4:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case 5:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStateText = (state: number) => {
    return PRODUCT_STATES[state] || "Unknown";
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Loading product information...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Error loading product information
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load product details: {error.message}
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  if (!productData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Product not found</DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This product does not exist or has been removed.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  // Parse the product data - it's returned as an array from the contract
  const [
    stockUnit,
    productCode,
    ownerID,
    farmerID,
    productID,
    productDate,
    productPrice,
    productSliced,
    itemState,
    distributorID,
    retailerID,
    consumerID,
    shippingDeadline,
    receivingDeadline,
    isExpired,
    ipfsHash,
  ] = productData as [
    bigint, // stockUnit
    bigint, // productCode
    `0x${string}`, // ownerID
    `0x${string}`, // farmerID
    bigint, // productID
    bigint, // productDate
    bigint, // productPrice
    bigint, // productSliced
    number, // itemState
    `0x${string}`, // distributorID
    `0x${string}`, // retailerID
    `0x${string}`, // consumerID
    bigint, // shippingDeadline
    bigint, // receivingDeadline
    boolean, // isExpired
    string // ipfsHash
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Product #{productCode.toString()}</span>
          </DialogTitle>
          <DialogDescription>
            Detailed information about this agricultural product
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and State */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className={getStateBadgeClass(Number(itemState))}
              >
                {getStateText(Number(itemState))}
              </Badge>
              {isExpired && <Badge variant="destructive">Expired</Badge>}
            </div>
            <div className="text-sm text-muted-foreground">
              Stock Units: {stockUnit.toString()}
            </div>
          </div>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Product Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Product Code
                  </label>
                  <p className="text-sm">{productCode.toString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Product ID
                  </label>
                  <p className="text-sm">{productID.toString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Price
                  </label>
                  <p className="text-sm font-semibold">
                    {formatEther(productPrice)} ETH
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Sliced Units
                  </label>
                  <p className="text-sm">{productSliced.toString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created Date
                  </label>
                  <p className="text-sm">{formatDate(productDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    IPFS Hash
                  </label>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-mono truncate">{ipfsHash}</p>
                    {ipfsHash && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://ipfs.io/ipfs/${ipfsHash}`,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supply Chain Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Supply Chain Participants</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Owner
                  </label>
                  <p className="text-sm font-mono">{formatAddress(ownerID)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Farmer
                  </label>
                  <p className="text-sm font-mono">{formatAddress(farmerID)}</p>
                </div>
                {distributorID !==
                  "0x0000000000000000000000000000000000000000" && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Distributor
                    </label>
                    <p className="text-sm font-mono">
                      {formatAddress(distributorID)}
                    </p>
                  </div>
                )}
                {retailerID !==
                  "0x0000000000000000000000000000000000000000" && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Retailer
                    </label>
                    <p className="text-sm font-mono">
                      {formatAddress(retailerID)}
                    </p>
                  </div>
                )}
                {consumerID !==
                  "0x0000000000000000000000000000000000000000" && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Consumer
                    </label>
                    <p className="text-sm font-mono">
                      {formatAddress(consumerID)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Deadlines</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Shipping Deadline
                  </label>
                  <p className="text-sm">{formatDate(shippingDeadline)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Receiving Deadline
                  </label>
                  <p className="text-sm">{formatDate(receivingDeadline)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
