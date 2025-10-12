"use client";

import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle,
  Plus,
  RefreshCw,
  BarChart3,
  CheckCircle,
} from "lucide-react";
import { useSupplyChain } from "@/hooks/useSupplyChain";
import { USER_ROLES } from "@/lib/contracts-wagmi";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { contractAddresses } from "@/lib/wagmi";
import { UserVerification } from "./UserVerification";
import { RoleManagement } from "./RoleManagement";
import { ProductDetailsModal } from "./ProductDetailsModal";
import { SupplyChainTester } from "./SupplyChainTester";
import { EscrowTester } from "./EscrowTester";
import { ReputationTester } from "./ReputationTester";

export function DashboardWagmi(): React.ReactElement {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const {
    role,
    isVerified,
    userProducts,
    totalProducts,
    isPending,
    error,
    produceItemByFarmer,
    fetchProductDetails,
  } = useSupplyChain();

  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<bigint | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "products"
    | "admin"
    | "testing"
    | "supplychain"
    | "escrow"
    | "reputation"
  >("overview");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleCreateProduct = async () => {
    if (!address) return;

    // Get form data from DOM elements
    const form = document.querySelector("form") as HTMLFormElement;
    if (!form) return;

    const formData = new FormData(form);
    const productName =
      (form.querySelector('input[type="text"]') as HTMLInputElement)?.value ||
      "";
    const description =
      (form.querySelector("textarea") as HTMLTextAreaElement)?.value || "";
    const ipfsHash =
      (form.querySelectorAll('input[type="text"]')[1] as HTMLInputElement)
        ?.value || "";
    const price =
      (form.querySelector('input[type="number"]') as HTMLInputElement)?.value ||
      "0.025";
    const shippingDeadline =
      (form.querySelector('input[type="datetime-local"]') as HTMLInputElement)
        ?.value || "";

    if (
      !productName ||
      !description ||
      !ipfsHash ||
      !price ||
      !shippingDeadline
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const productCode = BigInt(0); // Will be auto-generated
      const shippingDeadlineBigInt = BigInt(
        Math.floor(new Date(shippingDeadline).getTime() / 1000)
      );

      await produceItemByFarmer(
        productCode,
        ipfsHash,
        price,
        shippingDeadlineBigInt
      );
      setShowProductForm(false);
    } catch (error) {
      console.error("Product creation failed:", error);
    }
  };

  const handleViewDetails = (productId: bigint) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["readContract", contractAddresses.supplyChain],
    });
  };

  // Show success message when transaction is confirmed
  React.useEffect(() => {
    if (isPending === false && !error) {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [isPending, error]);

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to access the dashboard
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 justify-center border-b pb-4">
        <Button
          variant={activeTab === "overview" ? "default" : "outline"}
          onClick={() => setActiveTab("overview")}
          className="flex items-center space-x-2"
        >
          <BarChart3 className="h-4 w-4" />
          <span>Overview</span>
        </Button>
        <Button
          variant={activeTab === "products" ? "default" : "outline"}
          onClick={() => setActiveTab("products")}
          className="flex items-center space-x-2"
        >
          <Package className="h-4 w-4" />
          <span>My Products</span>
        </Button>
        {role === USER_ROLES.OWNER && (
          <Button
            variant={activeTab === "admin" ? "default" : "outline"}
            onClick={() => setActiveTab("admin")}
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Admin Tools</span>
          </Button>
        )}
        <Button
          variant={activeTab === "testing" ? "default" : "outline"}
          onClick={() => setActiveTab("testing")}
          className="flex items-center space-x-2"
        >
          <AlertCircle className="h-4 w-4" />
          <span>Contract Testing</span>
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          {/* Welcome Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to AgriChain
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your agricultural supply chain with blockchain technology.
              Track products, manage payments, and build reputation.
            </p>
            <div className="mt-4">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <Alert className="max-w-md mx-auto">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Transaction confirmed! Data refreshed automatically.
              </AlertDescription>
            </Alert>
          )}

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(totalProducts as bigint).toString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Your Products
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(userProducts as bigint[]).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  In your inventory
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Verification
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge
                    variant={
                      (isVerified as boolean as boolean)
                        ? "default"
                        : "destructive"
                    }
                  >
                    {(isVerified as boolean as boolean)
                      ? "Verified"
                      : "Not Verified"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Account status</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Role</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {role}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current permissions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(role === USER_ROLES.FARMER || role === USER_ROLES.OWNER) &&
                (isVerified as boolean) && (
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setActiveTab("products")}
                  >
                    <CardContent className="p-6 text-center">
                      <Plus className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-semibold">Create Product</h3>
                      <p className="text-sm text-muted-foreground">
                        Add new agricultural product
                      </p>
                    </CardContent>
                  </Card>
                )}

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setActiveTab("products")}
              >
                <CardContent className="p-6 text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold">View Products</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your inventory
                  </p>
                </CardContent>
              </Card>

              {role === USER_ROLES.OWNER && (
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab("admin")}
                >
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-semibold">Admin Tools</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage users & roles
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setActiveTab("testing")}
              >
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <h3 className="font-semibold">Test Contracts</h3>
                  <p className="text-sm text-muted-foreground">
                    Developer testing tools
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Transaction failed: {error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          {!(isVerified as boolean) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your account needs to be verified before you can create
                products. Contact the contract owner to get verified.
              </AlertDescription>
            </Alert>
          )}

          {/* Product Details Modal */}
          {selectedProductId && (
            <ProductDetailsModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              productId={selectedProductId}
              fetchProductDetails={fetchProductDetails}
            />
          )}
        </>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">My Products</h2>
            {(role === USER_ROLES.FARMER || role === USER_ROLES.OWNER) &&
              (isVerified as boolean) && (
                <Button onClick={() => setShowProductForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Product
                </Button>
              )}
          </div>

          {(userProducts as bigint[]).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
                <p className="text-muted-foreground mb-4">
                  {role === USER_ROLES.FARMER
                    ? "Start by creating your first agricultural product."
                    : "You don't have any products in your inventory yet."}
                </p>
                {(role === USER_ROLES.FARMER || role === USER_ROLES.OWNER) &&
                  (isVerified as boolean) && (
                    <Button onClick={() => setShowProductForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Product
                    </Button>
                  )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(userProducts as bigint[]).map((productId, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>Product #{productId.toString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Product ID: {productId.toString()}
                    </p>
                    <Button
                      className="w-full mt-4"
                      variant="outline"
                      onClick={() => handleViewDetails(productId)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Product Creation Form */}
          {showProductForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Product</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        defaultValue="Organic Heirloom Tomatoes"
                        className="w-full p-2 border rounded-md"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Name of your agricultural product
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Description *
                      </label>
                      <textarea
                        defaultValue="Premium Grade A organic heirloom tomatoes grown using sustainable farming practices. Rich in flavor and nutrients, perfect for fresh consumption or processing."
                        className="w-full p-2 border rounded-md h-20"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Detailed description of the product
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">IPFS Hash *</label>
                      <input
                        type="text"
                        placeholder="QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
                        className="w-full p-2 border rounded-md"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Metadata hash for product information
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Price (ETH) *
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0.001"
                        max="1000"
                        defaultValue="0.025"
                        className="w-full p-2 border rounded-md"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Price range: 0.001 - 1000 ETH
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Shipping Deadline *
                      </label>
                      <input
                        type="datetime-local"
                        defaultValue="2024-12-31T18:00"
                        className="w-full p-2 border rounded-md"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        When product must be shipped by
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Receiving Deadline
                      </label>
                      <input
                        type="datetime-local"
                        defaultValue="2025-01-07T18:00"
                        className="w-full p-2 border rounded-md"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        When product must be received by (optional)
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleCreateProduct}
                      disabled={isPending}
                      type="button"
                    >
                      {isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {isPending ? "Creating..." : "Create Product"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowProductForm(false)}
                      type="button"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Admin Tab */}
      {activeTab === "admin" && role === USER_ROLES.OWNER && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Admin Tools</h2>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>Owner</span>
            </Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserVerification />
            <RoleManagement />
          </div>
        </div>
      )}

      {/* Testing Tab */}
      {activeTab === "testing" && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Contract Testing</h2>
            <p className="text-muted-foreground mb-6">
              Advanced testing tools for developers and power users
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveTab("supplychain")}
            >
              <CardContent className="p-6 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">Supply Chain</h3>
                <p className="text-sm text-muted-foreground">
                  Test product lifecycle functions
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveTab("escrow")}
            >
              <CardContent className="p-6 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">Escrow System</h3>
                <p className="text-sm text-muted-foreground">
                  Test payment and dispute functions
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveTab("reputation")}
            >
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">Reputation System</h3>
                <p className="text-sm text-muted-foreground">
                  Test review and rating functions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Legacy Testing Tabs */}
      {activeTab === "supplychain" && <SupplyChainTester />}
      {activeTab === "escrow" && <EscrowTester />}
      {activeTab === "reputation" && <ReputationTester />}
    </div>
  );
}
