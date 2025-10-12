"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  Users,
  DollarSign,
  Truck,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Settings,
  Zap,
  User,
} from "lucide-react";
import { useSupplyChain } from "@/hooks/useSupplyChain";
import { USER_ROLES, PRODUCT_STATES } from "@/lib/contracts-wagmi";
import { formatEther, parseEther } from "viem";

export function SupplyChainTester() {
  const { address, isConnected } = useAccount();
  const {
    role,
    owner,
    isVerified,
    userProducts,
    totalProducts,
    isPending,
    fetchProductDetails,
    // Add all contract functions
    addFarmer,
    addDistributor,
    addRetailer,
    addConsumer,
    verifyUser,
    unverifyUser,
    produceItemByFarmer,
    sellItemByFarmer,
    purchaseItemByDistributor,
    shippedItemByFarmer,
    receivedItemByDistributor,
    processedItemByDistributor,
    packageItemByDistributor,
    sellItemByDistributor,
    purchaseItemByRetailer,
    shippedItemByDistributor,
    receivedItemByRetailer,
    sellItemByRetailer,
    purchaseItemByConsumer,
  } = useSupplyChain();

  const [testData, setTestData] = useState({
    productCode: "0",
    productName: "",
    description: "",
    ipfsHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    price: "0.05",
    shippingDeadline: "",
    receivingDeadline: "",
    slices: "10",
    userAddress: "",
  });

  const [selectedProduct, setSelectedProduct] = useState<bigint | null>(null);
  const [productDetails, setProductDetails] = useState<any>(null);

  const handleFetchProduct = async () => {
    if (!testData.productCode) return;
    try {
      const productCode = BigInt(testData.productCode);
      const details = fetchProductDetails(productCode);
      setProductDetails(details);
      setSelectedProduct(productCode);
    } catch (error) {
      console.error("Failed to fetch product:", error);
    }
  };

  const getStateBadgeColor = (state: number) => {
    const colors = [
      "bg-blue-100 text-blue-800", // Produced by Farmer
      "bg-green-100 text-green-800", // For Sale by Farmer
      "bg-purple-100 text-purple-800", // Purchased by Distributor
      "bg-yellow-100 text-yellow-800", // Shipped by Farmer
      "bg-indigo-100 text-indigo-800", // Received by Distributor
      "bg-pink-100 text-pink-800", // Processed by Distributor
      "bg-teal-100 text-teal-800", // Package by Distributor
      "bg-orange-100 text-orange-800", // For Sale by Distributor
      "bg-red-100 text-red-800", // Purchased by Retailer
      "bg-gray-100 text-gray-800", // Shipped by Distributor
      "bg-cyan-100 text-cyan-800", // Received by Retailer
      "bg-lime-100 text-lime-800", // For Sale by Retailer
      "bg-emerald-100 text-emerald-800", // Purchased by Consumer
    ];
    return colors[state] || "bg-gray-100 text-gray-800";
  };

  if (!isConnected) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to test smart contract features.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Supply Chain Contract Tester</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{role}</span>
          </Badge>
          {isVerified && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Verified</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts.toString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Products</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProducts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contract Owner
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono">{owner?.slice(0, 10)}...</div>
          </CardContent>
        </Card>
      </div>

      {/* Product Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Product Testing</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Lookup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="productCode">Product Code</Label>
              <Input
                id="productCode"
                value={testData.productCode}
                onChange={(e) =>
                  setTestData({ ...testData, productCode: e.target.value })
                }
                placeholder="Enter product code"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleFetchProduct} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Fetch Product
              </Button>
            </div>
          </div>

          {/* Product Details */}
          {productDetails && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold mb-2">Product Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  State:{" "}
                  <Badge
                    className={getStateBadgeColor(
                      productDetails.data?.itemState || 0
                    )}
                  >
                    {PRODUCT_STATES[productDetails.data?.itemState || 0]}
                  </Badge>
                </div>
                <div>
                  Price: {formatEther(productDetails.data?.productPrice || 0)}{" "}
                  ETH
                </div>
                <div>
                  Farmer: {productDetails.data?.farmerID?.slice(0, 10)}...
                </div>
                <div>
                  IPFS: {productDetails.data?.ipfsHash?.slice(0, 20)}...
                </div>
              </div>
            </div>
          )}

          {/* Product Creation Form */}
          {(role === USER_ROLES.FARMER || role === USER_ROLES.OWNER) &&
            isVerified && (
              <div className="space-y-4">
                <h4 className="font-semibold">Create New Product</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      value={testData.productName}
                      onChange={(e) =>
                        setTestData({
                          ...testData,
                          productName: e.target.value,
                        })
                      }
                      placeholder="Organic Tomatoes"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Required: Name of the product
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      value={testData.description}
                      onChange={(e) =>
                        setTestData({
                          ...testData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Grade A Premium Quality Organic Tomatoes"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Required: Detailed product description
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="ipfsHash">IPFS Hash *</Label>
                    <Input
                      id="ipfsHash"
                      value={testData.ipfsHash}
                      onChange={(e) =>
                        setTestData({ ...testData, ipfsHash: e.target.value })
                      }
                      placeholder="QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Required: Metadata hash for product information
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="price">Price (ETH) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.001"
                      min="0.001"
                      max="1000"
                      value={testData.price}
                      onChange={(e) =>
                        setTestData({ ...testData, price: e.target.value })
                      }
                      placeholder="0.05"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Range: 0.001 - 1000 ETH
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="shippingDeadline">
                      Shipping Deadline *
                    </Label>
                    <Input
                      id="shippingDeadline"
                      type="datetime-local"
                      value={testData.shippingDeadline}
                      onChange={(e) =>
                        setTestData({
                          ...testData,
                          shippingDeadline: e.target.value,
                        })
                      }
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      When product must be shipped by
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="receivingDeadline">
                      Receiving Deadline
                    </Label>
                    <Input
                      id="receivingDeadline"
                      type="datetime-local"
                      value={testData.receivingDeadline}
                      onChange={(e) =>
                        setTestData({
                          ...testData,
                          receivingDeadline: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      When product must be received by (optional)
                    </p>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      if (
                        !testData.productName ||
                        !testData.description ||
                        !testData.ipfsHash ||
                        !testData.price ||
                        !testData.shippingDeadline
                      ) {
                        alert("Please fill all required fields");
                        return;
                      }
                      const productCode = BigInt(0);
                      const shippingDeadline = BigInt(
                        Math.floor(
                          new Date(testData.shippingDeadline).getTime() / 1000
                        )
                      );
                      produceItemByFarmer(
                        productCode,
                        testData.ipfsHash,
                        testData.price,
                        shippingDeadline
                      );
                    }}
                    className="w-full"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Package className="h-4 w-4 mr-2" />
                    )}
                    {isPending ? "Creating..." : "Create Product"}
                  </Button>
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Product Lifecycle Testing */}
      {selectedProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="h-5 w-5" />
              <span>Product Lifecycle Testing</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Farmer Actions */}
              {role === USER_ROLES.FARMER && (
                <>
                  <Button
                    onClick={() =>
                      sellItemByFarmer(selectedProduct, testData.price)
                    }
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <DollarSign className="h-6 w-6" />
                    <span>Put for Sale</span>
                    <span className="text-xs text-gray-500">
                      Farmer → Market
                    </span>
                  </Button>
                  <Button
                    onClick={() => shippedItemByFarmer(selectedProduct)}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <Truck className="h-6 w-6" />
                    <span>Ship Product</span>
                    <span className="text-xs text-gray-500">
                      Farmer → Distributor
                    </span>
                  </Button>
                </>
              )}

              {/* Distributor Actions */}
              {role === USER_ROLES.DISTRIBUTOR && (
                <>
                  <Button
                    onClick={() =>
                      purchaseItemByDistributor(selectedProduct, testData.price)
                    }
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <DollarSign className="h-6 w-6" />
                    <span>Purchase</span>
                    <span className="text-xs text-gray-500">
                      Buy from Farmer
                    </span>
                  </Button>
                  <Button
                    onClick={() => receivedItemByDistributor(selectedProduct)}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <CheckCircle className="h-6 w-6" />
                    <span>Mark Received</span>
                    <span className="text-xs text-gray-500">
                      Confirm Delivery
                    </span>
                  </Button>
                  <Button
                    onClick={() =>
                      processedItemByDistributor(
                        selectedProduct,
                        BigInt(testData.slices)
                      )
                    }
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <Package className="h-6 w-6" />
                    <span>Process</span>
                    <span className="text-xs text-gray-500">Slice Product</span>
                  </Button>
                  <Button
                    onClick={() => packageItemByDistributor(selectedProduct)}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <Package className="h-6 w-6" />
                    <span>Package</span>
                    <span className="text-xs text-gray-500">
                      Ready for Sale
                    </span>
                  </Button>
                  <Button
                    onClick={() =>
                      sellItemByDistributor(selectedProduct, testData.price)
                    }
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <DollarSign className="h-6 w-6" />
                    <span>Put for Sale</span>
                    <span className="text-xs text-gray-500">
                      Distributor → Market
                    </span>
                  </Button>
                  <Button
                    onClick={() => shippedItemByDistributor(selectedProduct)}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <Truck className="h-6 w-6" />
                    <span>Ship Product</span>
                    <span className="text-xs text-gray-500">
                      Distributor → Retailer
                    </span>
                  </Button>
                </>
              )}

              {/* Retailer Actions */}
              {role === USER_ROLES.RETAILER && (
                <>
                  <Button
                    onClick={() =>
                      purchaseItemByRetailer(selectedProduct, testData.price)
                    }
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <DollarSign className="h-6 w-6" />
                    <span>Purchase</span>
                    <span className="text-xs text-gray-500">
                      Buy from Distributor
                    </span>
                  </Button>
                  <Button
                    onClick={() => receivedItemByRetailer(selectedProduct)}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <CheckCircle className="h-6 w-6" />
                    <span>Mark Received</span>
                    <span className="text-xs text-gray-500">
                      Confirm Delivery
                    </span>
                  </Button>
                  <Button
                    onClick={() =>
                      sellItemByRetailer(selectedProduct, testData.price)
                    }
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                  >
                    <DollarSign className="h-6 w-6" />
                    <span>Put for Sale</span>
                    <span className="text-xs text-gray-500">
                      Retailer → Market
                    </span>
                  </Button>
                </>
              )}

              {/* Consumer Actions */}
              {role === USER_ROLES.CONSUMER && (
                <Button
                  onClick={() =>
                    purchaseItemByConsumer(selectedProduct, testData.price)
                  }
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <DollarSign className="h-6 w-6" />
                  <span>Purchase</span>
                  <span className="text-xs text-gray-500">
                    Buy from Retailer
                  </span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Functions */}
      {role === USER_ROLES.OWNER && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Admin Functions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userAddress">User Address</Label>
                <Input
                  id="userAddress"
                  value={testData.userAddress}
                  onChange={(e) =>
                    setTestData({ ...testData, userAddress: e.target.value })
                  }
                  placeholder="0x..."
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() =>
                    setTestData({ ...testData, userAddress: address || "" })
                  }
                  variant="outline"
                  className="w-full"
                >
                  <User className="h-4 w-4 mr-2" />
                  Use My Address
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                onClick={() => addFarmer(testData.userAddress as `0x${string}`)}
                variant="outline"
                size="sm"
              >
                Add Farmer
              </Button>
              <Button
                onClick={() =>
                  addDistributor(testData.userAddress as `0x${string}`)
                }
                variant="outline"
                size="sm"
              >
                Add Distributor
              </Button>
              <Button
                onClick={() =>
                  addRetailer(testData.userAddress as `0x${string}`)
                }
                variant="outline"
                size="sm"
              >
                Add Retailer
              </Button>
              <Button
                onClick={() =>
                  addConsumer(testData.userAddress as `0x${string}`)
                }
                variant="outline"
                size="sm"
              >
                Add Consumer
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() =>
                  verifyUser(testData.userAddress as `0x${string}`)
                }
                variant="outline"
                size="sm"
              >
                Verify User
              </Button>
              <Button
                onClick={() =>
                  unverifyUser(testData.userAddress as `0x${string}`)
                }
                variant="outline"
                size="sm"
              >
                Unverify User
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
