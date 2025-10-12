const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Get the contract factories
  const Escrow = await ethers.getContractFactory("Escrow");
  const Reputation = await ethers.getContractFactory("Reputation");
  const SupplyChain = await ethers.getContractFactory("SupplyChain");

  // Deploy Escrow contract first
  console.log("Deploying Escrow contract...");
  const escrow = await Escrow.deploy();
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("Escrow deployed to:", escrowAddress);

  // Deploy Reputation contract
  console.log("Deploying Reputation contract...");
  const reputation = await Reputation.deploy();
  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();
  console.log("Reputation deployed to:", reputationAddress);

  // Deploy SupplyChain contract with references to Escrow and Reputation
  console.log("Deploying SupplyChain contract...");
  const supplyChain = await SupplyChain.deploy(
    escrowAddress,
    reputationAddress
  );
  await supplyChain.waitForDeployment();
  const supplyChainAddress = await supplyChain.getAddress();
  console.log("SupplyChain deployed to:", supplyChainAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("Escrow:", escrowAddress);
  console.log("Reputation:", reputationAddress);
  console.log("SupplyChain:", supplyChainAddress);

  // Save deployment addresses to a file for frontend use
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contracts: {
      Escrow: escrowAddress,
      Reputation: reputationAddress,
      SupplyChain: supplyChainAddress,
    },
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./deployments.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployments.json");

  // Verify contracts on block explorer (if not localhost)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await escrow.deploymentTransaction().wait(6);
    await reputation.deploymentTransaction().wait(6);
    await supplyChain.deploymentTransaction().wait(6);

    console.log("Verifying contracts on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: escrowAddress,
        constructorArguments: [],
      });
      console.log("Escrow verified");

      await hre.run("verify:verify", {
        address: reputationAddress,
        constructorArguments: [],
      });
      console.log("Reputation verified");

      await hre.run("verify:verify", {
        address: supplyChainAddress,
        constructorArguments: [escrowAddress, reputationAddress],
      });
      console.log("SupplyChain verified");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
