const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SupplyChain", function () {
  let supplyChain;
  let escrow;
  let reputation;
  let owner;
  let farmer;
  let distributor;
  let retailer;
  let consumer;
  let arbitrator;

  const productPrice = ethers.parseEther("0.1");
  const ipfsHash = "QmTestHash123456789";
  const shippingDeadline = Math.floor(Date.now() / 1000) + 86400; // 1 day from now

  beforeEach(async function () {
    [owner, farmer, distributor, retailer, consumer, arbitrator] =
      await ethers.getSigners();

    // Deploy contracts
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    const Reputation = await ethers.getContractFactory("Reputation");
    reputation = await Reputation.deploy();
    await reputation.waitForDeployment();

    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    supplyChain = await SupplyChain.deploy(
      await escrow.getAddress(),
      await reputation.getAddress()
    );
    await supplyChain.waitForDeployment();

    // Add roles
    await supplyChain.addFarmer(farmer.address);
    await supplyChain.addDistributor(distributor.address);
    await supplyChain.addRetailer(retailer.address);
    await supplyChain.addConsumer(consumer.address);

    // Verify users
    await supplyChain.verifyUser(farmer.address);
    await supplyChain.verifyUser(distributor.address);
    await supplyChain.verifyUser(retailer.address);
    await supplyChain.verifyUser(consumer.address);

    // Register users in reputation system
    await reputation.registerUser(farmer.address);
    await reputation.registerUser(distributor.address);
    await reputation.registerUser(retailer.address);
    await reputation.registerUser(consumer.address);
  });

  describe("Product Creation", function () {
    it("Should create a product successfully", async function () {
      const tx = await supplyChain.connect(farmer).produceItemByFarmer(
        0, // productCode (will be overridden)
        ipfsHash,
        productPrice,
        shippingDeadline
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find((log) => {
        try {
          const parsed = supplyChain.interface.parseLog(log);
          return parsed.name === "ProduceByFarmer";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;

      const parsedEvent = supplyChain.interface.parseLog(event);
      expect(parsedEvent.args.farmer).to.equal(farmer.address);

      const item = await supplyChain.fetchItem(1);
      expect(item.farmerID).to.equal(farmer.address);
      expect(item.productPrice).to.equal(productPrice);
      expect(item.ipfsHash).to.equal(ipfsHash);
      expect(item.itemState).to.equal(0); // ProduceByFarmer
    });

    it("Should reject product creation with invalid price", async function () {
      await expect(
        supplyChain.connect(farmer).produceItemByFarmer(
          0,
          ipfsHash,
          0, // Invalid price
          shippingDeadline
        )
      ).to.be.revertedWith("Invalid price range");
    });

    it("Should reject product creation with past deadline", async function () {
      await expect(
        supplyChain.connect(farmer).produceItemByFarmer(
          0,
          ipfsHash,
          productPrice,
          Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
        )
      ).to.be.revertedWith("Invalid shipping deadline");
    });
  });

  describe("Product Sale and Purchase", function () {
    let productCode;

    beforeEach(async function () {
      // Create a product for testing
      await supplyChain.connect(farmer).produceItemByFarmer(
        0, // This will be overridden
        ipfsHash,
        productPrice,
        shippingDeadline
      );
      productCode = 1; // First product gets ID 1
    });

    it("Should allow farmer to sell product", async function () {
      const newPrice = ethers.parseEther("0.15");

      const tx = await supplyChain
        .connect(farmer)
        .sellItemByFarmer(productCode, newPrice);
      const receipt = await tx.wait();

      const event = receipt.logs.find((log) => {
        try {
          const parsed = supplyChain.interface.parseLog(log);
          return parsed.name === "ForSaleByFarmer";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;

      const parsedEvent = supplyChain.interface.parseLog(event);
      expect(parsedEvent.args.productCode).to.equal(productCode);
      expect(parsedEvent.args.price).to.equal(newPrice);

      const item = await supplyChain.fetchItem(productCode);
      expect(item.itemState).to.equal(1); // ForSaleByFarmer
      expect(item.productPrice).to.equal(newPrice);
    });

    it("Should allow distributor to purchase product with escrow", async function () {
      await supplyChain
        .connect(farmer)
        .sellItemByFarmer(productCode, productPrice);

      const tx = await supplyChain
        .connect(distributor)
        .purchaseItemByDistributor(productCode, {
          value: productPrice,
        });

      const receipt = await tx.wait();
      const event = receipt.logs.find((log) => {
        try {
          const parsed = supplyChain.interface.parseLog(log);
          return parsed.name === "PurchasedByDistributor";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;

      const parsedEvent = supplyChain.interface.parseLog(event);
      expect(parsedEvent.args.distributor).to.equal(distributor.address);

      const item = await supplyChain.fetchItem(productCode);
      expect(item.itemState).to.equal(2); // PurchasedByDistributor
      expect(item.ownerID).to.equal(distributor.address);
      expect(item.distributorID).to.equal(distributor.address);
    });

    it("Should reject purchase with insufficient payment", async function () {
      await supplyChain
        .connect(farmer)
        .sellItemByFarmer(productCode, productPrice);

      await expect(
        supplyChain
          .connect(distributor)
          .purchaseItemByDistributor(productCode, {
            value: ethers.parseEther("0.05"), // Insufficient payment
          })
      ).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Supply Chain Flow", function () {
    let productCode;

    beforeEach(async function () {
      // Create and sell product
      await supplyChain
        .connect(farmer)
        .produceItemByFarmer(0, ipfsHash, productPrice, shippingDeadline);
      productCode = 1; // First product gets ID 1
      await supplyChain
        .connect(farmer)
        .sellItemByFarmer(productCode, productPrice);
      await supplyChain
        .connect(distributor)
        .purchaseItemByDistributor(productCode, {
          value: productPrice,
        });
    });

    it("Should complete full supply chain flow", async function () {
      // Farmer ships
      await supplyChain.connect(farmer).shippedItemByFarmer(productCode);
      let item = await supplyChain.fetchItem(productCode);
      expect(item.itemState).to.equal(3); // ShippedByFarmer

      // Distributor receives
      await supplyChain
        .connect(distributor)
        .receivedItemByDistributor(productCode);
      item = await supplyChain.fetchItem(productCode);
      expect(item.itemState).to.equal(4); // ReceivedByDistributor

      // Distributor processes
      await supplyChain
        .connect(distributor)
        .processedItemByDistributor(productCode, 5);
      item = await supplyChain.fetchItem(productCode);
      expect(item.itemState).to.equal(5); // ProcessedByDistributor
      expect(item.productSliced).to.equal(5);

      // Distributor packages
      await supplyChain
        .connect(distributor)
        .packageItemByDistributor(productCode);
      item = await supplyChain.fetchItem(productCode);
      expect(item.itemState).to.equal(6); // PackageByDistributor

      // Distributor sells
      const distributorPrice = ethers.parseEther("0.2");
      await supplyChain
        .connect(distributor)
        .sellItemByDistributor(productCode, distributorPrice);
      item = await supplyChain.fetchItem(productCode);
      expect(item.itemState).to.equal(7); // ForSaleByDistributor

      // Retailer purchases
      await supplyChain.connect(retailer).purchaseItemByRetailer(productCode, {
        value: distributorPrice,
      });
      item = await supplyChain.fetchItem(productCode);
      expect(item.itemState).to.equal(8); // PurchasedByRetailer

      // Distributor ships to retailer
      await supplyChain
        .connect(distributor)
        .shippedItemByDistributor(productCode);
      item = await supplyChain.fetchItem(productCode);
      expect(item.itemState).to.equal(9); // ShippedByDistributor

      // Retailer receives
      await supplyChain.connect(retailer).receivedItemByRetailer(productCode);
      item = await supplyChain.fetchItem(productCode);
      expect(item.itemState).to.equal(10); // ReceivedByRetailer

      // Retailer sells
      const retailerPrice = ethers.parseEther("0.25");
      await supplyChain
        .connect(retailer)
        .sellItemByRetailer(productCode, retailerPrice);
      item = await supplyChain.fetchItem(productCode);
      expect(item.itemState).to.equal(11); // ForSaleByRetailer

      // Consumer purchases
      await supplyChain.connect(consumer).purchaseItemByConsumer(productCode, {
        value: retailerPrice,
      });
      item = await supplyChain.fetchItem(productCode);
      expect(item.itemState).to.equal(12); // PurchasedByConsumer
      expect(item.consumerID).to.equal(consumer.address);
    });
  });

  describe("Batch Operations", function () {
    it("Should create batch operation", async function () {
      // First create some products
      await supplyChain
        .connect(farmer)
        .produceItemByFarmer(0, ipfsHash, productPrice, shippingDeadline);
      await supplyChain
        .connect(farmer)
        .produceItemByFarmer(0, ipfsHash, productPrice, shippingDeadline);
      await supplyChain
        .connect(farmer)
        .produceItemByFarmer(0, ipfsHash, productPrice, shippingDeadline);

      const productCodes = [1, 2, 3];

      const tx = await supplyChain
        .connect(owner)
        .createBatchOperation(productCodes);
      const receipt = await tx.wait();

      const event = receipt.logs.find((log) => {
        try {
          const parsed = supplyChain.interface.parseLog(log);
          return parsed.name === "BatchOperationCreated";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;

      const parsedEvent = supplyChain.interface.parseLog(event);
      expect(parsedEvent.args.batchId).to.equal(1);
      expect(parsedEvent.args.productCount).to.equal(3);

      const batch = await supplyChain.batchOperations(1);
      expect(batch.operator).to.equal(owner.address);
      expect(batch.timestamp).to.be.greaterThan(0);
      expect(batch.isCompleted).to.be.false;
    });

    it("Should reject batch operation exceeding limit", async function () {
      const productCodes = Array(51)
        .fill()
        .map((_, i) => i + 1); // 51 products

      await expect(
        supplyChain.connect(owner).createBatchOperation(productCodes)
      ).to.be.revertedWith("Batch limit exceeded");
    });
  });

  describe("Reputation System", function () {
    it("Should add review", async function () {
      const tx = await reputation.connect(distributor).addReview(
        farmer.address,
        5, // 5-star rating
        "Excellent farmer!"
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find((log) => {
        try {
          const parsed = reputation.interface.parseLog(log);
          return parsed.name === "ReviewAdded";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;

      const parsedEvent = reputation.interface.parseLog(event);
      expect(parsedEvent.args.reviewee).to.equal(farmer.address);
      expect(parsedEvent.args.rating).to.equal(5);
    });

    it("Should verify review and update reputation", async function () {
      // First add a review
      await reputation
        .connect(distributor)
        .addReview(farmer.address, 5, "Excellent farmer!");

      const reviewId = 1;

      await reputation.connect(owner).verifyReview(reviewId);

      const farmerRep = await reputation.getUserReputation(farmer.address);
      expect(farmerRep.score).to.be.greaterThan(500);
    });

    it("Should record successful transaction", async function () {
      const initialRep = await reputation.getUserReputation(farmer.address);

      await reputation.connect(owner).recordTransactionSuccess(farmer.address);

      const updatedRep = await reputation.getUserReputation(farmer.address);
      expect(updatedRep.score).to.be.greaterThan(initialRep.score);
      expect(updatedRep.successfulTransactions).to.be.greaterThan(
        initialRep.successfulTransactions
      );
    });
  });

  describe("Escrow System", function () {
    it("Should create escrow for purchase", async function () {
      const tx = await escrow.connect(distributor).createEscrow(
        1, // productCode
        distributor.address,
        farmer.address,
        shippingDeadline,
        { value: productPrice }
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find((log) => {
        try {
          const parsed = escrow.interface.parseLog(log);
          return parsed.name === "EscrowCreated";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;

      const parsedEvent = escrow.interface.parseLog(event);
      expect(parsedEvent.args.buyer).to.equal(distributor.address);
      expect(parsedEvent.args.seller).to.equal(farmer.address);
      expect(parsedEvent.args.amount).to.equal(productPrice);
    });

    it("Should open dispute", async function () {
      // Create escrow first
      await escrow
        .connect(distributor)
        .createEscrow(
          2,
          distributor.address,
          farmer.address,
          shippingDeadline,
          { value: productPrice }
        );

      const tx = await escrow.connect(distributor).openDispute(
        1, // escrowId
        "Product quality issue",
        { value: ethers.parseEther("0.01") } // Arbitration fee
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find((log) => {
        try {
          const parsed = escrow.interface.parseLog(log);
          return parsed.name === "DisputeOpened";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;

      const parsedEvent = escrow.interface.parseLog(event);
      expect(parsedEvent.args.escrowId).to.equal(1);
    });

    it("Should resolve dispute", async function () {
      // Create escrow and dispute
      await escrow
        .connect(distributor)
        .createEscrow(
          3,
          distributor.address,
          farmer.address,
          shippingDeadline,
          { value: productPrice }
        );
      await escrow.connect(distributor).openDispute(1, "Quality issue", {
        value: ethers.parseEther("0.01"),
      });

      // Add arbitrator
      await escrow.connect(owner).addArbitrator(arbitrator.address);

      const tx = await escrow.connect(arbitrator).resolveDispute(1, 1); // Resolution.Buyer

      const receipt = await tx.wait();
      const event = receipt.logs.find((log) => {
        try {
          const parsed = escrow.interface.parseLog(log);
          return parsed.name === "DisputeResolved";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;

      const parsedEvent = escrow.interface.parseLog(event);
      expect(parsedEvent.args.escrowId).to.equal(1);
    });
  });

  describe("Access Control", function () {
    it("Should reject unauthorized user actions", async function () {
      await expect(
        supplyChain
          .connect(consumer)
          .produceItemByFarmer(0, ipfsHash, productPrice, shippingDeadline)
      ).to.be.revertedWith("Only farmers can perform this action");
    });

    it("Should reject unverified user actions", async function () {
      const [, , , , , , unverifiedUser] = await ethers.getSigners();
      await supplyChain.addFarmer(unverifiedUser.address);

      await expect(
        supplyChain
          .connect(unverifiedUser)
          .produceItemByFarmer(0, ipfsHash, productPrice, shippingDeadline)
      ).to.be.revertedWith("User not verified");
    });
  });

  describe("Pause Functionality", function () {
    it("Should pause and unpause contract", async function () {
      await supplyChain.connect(owner).pause();

      await expect(
        supplyChain
          .connect(farmer)
          .produceItemByFarmer(0, ipfsHash, productPrice, shippingDeadline)
      ).to.be.revertedWithCustomError(supplyChain, "EnforcedPause");

      await supplyChain.connect(owner).unpause();

      // Should work after unpause
      const tx = await supplyChain
        .connect(farmer)
        .produceItemByFarmer(0, ipfsHash, productPrice, shippingDeadline);
      expect(tx).to.not.be.undefined;
    });
  });
});
