"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Shield,
  Star,
  Settings,
  TestTube,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { SupplyChainTester } from "./SupplyChainTester";
import { EscrowTester } from "./EscrowTester";
import { ReputationTester } from "./ReputationTester";

type TestTab = "supplychain" | "escrow" | "reputation";

export function ContractTester() {
  const [activeTab, setActiveTab] = useState<TestTab>("supplychain");

  const tabs = [
    {
      id: "supplychain" as TestTab,
      label: "Supply Chain",
      icon: Package,
      description: "Test product lifecycle, roles, and core functions",
    },
    {
      id: "escrow" as TestTab,
      label: "Escrow",
      icon: Shield,
      description: "Test payment escrow and dispute resolution",
    },
    {
      id: "reputation" as TestTab,
      label: "Reputation",
      icon: Star,
      description: "Test user ratings and reputation system",
    },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "supplychain":
        return <SupplyChainTester />;
      case "escrow":
        return <EscrowTester />;
      case "reputation":
        return <ReputationTester />;
      default:
        return <SupplyChainTester />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Smart Contract Testing Suite
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Comprehensive testing interface for all smart contract features. Test
          product lifecycle, escrow payments, and reputation system.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supply Chain</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Ready</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Product lifecycle, roles, admin functions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escrow</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Ready</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Payment escrow, disputes, arbitration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputation</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Ready</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              User ratings, reviews, reputation scores
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>Contract Testing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Tab Description */}
          <div className="mb-6">
            <Badge variant="outline" className="mb-2">
              {tabs.find((tab) => tab.id === activeTab)?.label} Testing
            </Badge>
            <p className="text-sm text-muted-foreground">
              {tabs.find((tab) => tab.id === activeTab)?.description}
            </p>
          </div>

          {/* Active Tab Content */}
          {renderActiveTab()}
        </CardContent>
      </Card>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Testing Instructions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Supply Chain Testing</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Connect as Owner to test admin functions</li>
                <li>• Add roles (Farmer, Distributor, etc.)</li>
                <li>• Verify users before they can create products</li>
                <li>• Test complete product lifecycle</li>
                <li>• Check product state transitions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Escrow Testing</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Create escrow for product payments</li>
                <li>• Test payment release and refunds</li>
                <li>• Open disputes for failed transactions</li>
                <li>• Test arbitration resolution</li>
                <li>• Add/remove arbitrators</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Reputation Testing</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Register users in reputation system</li>
                <li>• Add reviews and ratings (1-5 stars)</li>
                <li>• Verify reviews as admin</li>
                <li>• Record transaction success/failure</li>
                <li>• Check reputation scores and levels</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
