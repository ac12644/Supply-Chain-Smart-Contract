<!-- PROJECT LOGO -->

<br />
<div align="center">
  <a href="#">
    <img src="https://github.com/ac12644/Supply-Chain/blob/main/images/AgriChainLogo.png" alt="Logo" width="145" height="55">
  </a>
  
  <a href="https://betterprogramming.pub/supply-chain-smart-contract-design-e0ae5071bcbe">Explore full article</a>

  <p align="center">
    This smart contract is designed to simplify the operation of the agricultural supply chain. It increases transparency and efficiency between farmer, distributor, retailer and consumer.
  </p>
</div>

## About The Project

The agricultural industry is a major contributor to the global economy, with over $6 trillion in revenue every year. This industry provides the world with essential commodities such as rice, corn, wheat and livestock. However, despite its vital role in providing essential products around the globe, agricultural supply chains face many common challenges across geographies and commodities.

Blockchain technology creates a single source of truth. This is important for supply chains that involve multiple participants in a network who don't necessarily trust each other.

In this project, I have taken a practical approach. The codes are designed to simplify the operation of the agricultural supply chain and can be modified easily based on needs and requirement. Below is given a flow diagram for supply chain:

![Flow diagram](/images/flow.png)

### ⚙️Functions:

1. Farmer creates a product and lists it to be purchased by Distributor
2. Farmer ships the product
3. Distributor receives the product, process it, package it and put it on sale
4. Retailer buys the product from Distributor
5. Distributor ships the product to Retailer
6. Retailer receives the product and put it on sale
7. Consumer purchase the product

### To Do

- Front end development(in process)

### Versions

- Solidity ^0.8.0

- Truffle: v5.5.23

- Node: v16.17.0

### Installation

\_Below are instructions to get started

1. Clone the repo
   ```sh
   git clone https://github.com/ac12644/Supply-Chain.git
   ```
2. Install packages
   ```sh
   yarn
   ```
3. start truffle development nework
   ```sh
   truffle develop
   ```
4. test smart contracts
   ```sh
    $truffle(develop)> test
   ```
5. to deploy run
   ```sh
    $truffle(develop)> deploy
   ```

### Specification

### Modifiers

1. Checking ownership and values paid

```solidity
// Define a modifer that checks to see if msg.sender == owner of the contract
modifier onlyOwner() {
  require(msg.sender == owner);
  _;
}

// Define a modifer that verifies the Caller
modifier verifyCaller (address _address) {
  require(msg.sender == _address);
  _;
}

// Define a modifier that checks if the paid amount is sufficient to cover the price
modifier paidEnough(uint _price) {
  require(msg.value >= _price);
  _;
}

// Define a modifier that checks the price and refunds the remaining balance
modifier checkValue(uint _productCode, address payable addressToFund) { // ADDED address payable
  uint _price = items[_productCode].productPrice;
  uint  amountToReturn = msg.value - _price;
  addressToFund.transfer(amountToReturn);
  _;
}
```

2. Check the item has passed the previous step of the supplychain.

```solidity
// itemState : 0
modifier producedByFarmer(uint _productCode) {
  require(items[_productCode].itemState == State.ProduceByFarmer);
  _;
}
// State : 1
modifier forSaleByFarmer(uint _productCode) {
  require(items[_productCode].itemState == State.ForSaleByFarmer);
  _;
}
// State : 2
modifier purchasedByDistributor(uint _productCode) {
  require(items[_productCode].itemState == State.PurchasedByDistributor);
  _;
}
// State : 3
modifier shippedByFarmer(uint _productCode) {
  require(items[_productCode].itemState == State.ShippedByFarmer);
  _;
}
// State : 4
modifier receivedByDistributor(uint _productCode) {
  require(items[_productCode].itemState == State.ReceivedByDistributor);
  _;
}
// State : 5
modifier processByDistributor(uint _productCode) {
  require(items[_productCode].itemState == State.ProcessedByDistributor);
  _;
}
// State : 6
modifier packagedByDistributor(uint _productCode) {
  require(items[_productCode].itemState == State.PackageByDistributor);
  _;
}
// State : 7
modifier forSaleByDistributor(uint _productCode) {
  require(items[_productCode].itemState == State.ForSaleByDistributor);
  _;
}

// State : 8
modifier shippedByDistributor(uint _productCode) {
  require(items[_productCode].itemState == State.ShippedByDistributor);
  _;
}
// State : 9
modifier purchasedByRetailer(uint _productCode) {
  require(items[_productCode].itemState == State.PurchasedByRetailer);
  _;
}
// State : 10
modifier receivedByRetailer(uint _productCode) {
  require(items[_productCode].itemState == State.ReceivedByRetailer);
  _;
}
// State : 11
modifier forSaleByRetailer(uint _productCode) {
  require(items[_productCode].itemState == State.ForSaleByRetailer);
  _;
}
// State : 12
modifier purchasedByConsumer(uint _productCode) {
  require(items[_productCode].itemState == State.PurchasedByConsumer);
  _;
}
```

3. Role based modifiers inherited from other contracts.

_Note: Used to implement Access Control_

```solidity
// FarmerRole.sol
modifier onlyFarmer() {
  require(isFarmer(msg.sender));
  _;
}
// DistributorRole.sol
modifier onlyDistributor() {
  require(isDistributor(msg.sender));
  _;
}
// RetailerRole.sol
modifier onlyRetailer() {
   require(isRetailer(msg.sender));
  _;
}
// ConsumerRole.sol
modifier onlyConsumer() {
  require(isConsumer(msg.sender));
  _;
}

```

### Events

Each supplychain function emits its own event.

```solidity
event ProduceByFarmer(uint productCode);         //1
event ForSaleByFarmer(uint productCode);         //2
event PurchasedByDistributor(uint productCode);  //3
event ShippedByFarmer(uint productCode);         //4
event ReceivedByDistributor(uint productCode);   //5
event ProcessedByDistributor(uint productCode);  //6
event PackagedByDistributor(uint productCode);   //7
event ForSaleByDistributor(uint productCode);    //8
event PurchasedByRetailer(uint productCode);     //9
event ShippedByDistributor(uint productCode);    //10
event ReceivedByRetailer(uint productCode);      //11
event ForSaleByRetailer(uint productCode);       //12
event PurchasedByConsumer(uint productCode);     //13
```
