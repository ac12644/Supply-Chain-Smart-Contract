<!-- PROJECT LOGO -->

<br />
<div align="center">
  <a href="#">
    <img src="https://cdn-icons-png.flaticon.com/512/5341/5341391.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Agriculture Supply Chain</h3>

  <p align="center">
    This smart contract is designed to simplify the operation of the agricultural supply chain. It increases transparency, efficiency and privacy between buyer and seller.
  </p>
</div>

### Specification

### Modifiers

1. Checking ownership and values payed

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
modifier checkValue(uint _upc, address payable addressToFund) { // ADDED address payable
  uint _price = items[_upc].productPrice;
  uint  amountToReturn = msg.value - _price;
  addressToFund.transfer(amountToReturn);
  _;
}
```

2. Check the item has passed the previous step of the supplychain.

```solidity
// itemState : 0
modifier producedByFarmer(uint _upc) {
  require(items[_upc].itemState == State.ProduceByFarmer);
  _;
}
// State : 1
modifier forSaleByFarmer(uint _upc) {
  require(items[_upc].itemState == State.ForSaleByFarmer);
  _;
}
// State : 2
modifier purchasedByDistributor(uint _upc) {
  require(items[_upc].itemState == State.PurchasedByDistributor);
  _;
}
// State : 3
modifier shippedByFarmer(uint _upc) {
  require(items[_upc].itemState == State.ShippedByFarmer);
  _;
}
// State : 4
modifier receivedByDistributor(uint _upc) {
  require(items[_upc].itemState == State.ReceivedByDistributor);
  _;
}
// State : 5
modifier processByDistributor(uint _upc) {
  require(items[_upc].itemState == State.ProcessedByDistributor);
  _;
}
// State : 6
modifier packagedByDistributor(uint _upc) {
  require(items[_upc].itemState == State.PackageByDistributor);
  _;
}
// State : 7
modifier forSaleByDistributor(uint _upc) {
  require(items[_upc].itemState == State.ForSaleByDistributor);
  _;
}

// State : 8
modifier shippedByDistributor(uint _upc) {
  require(items[_upc].itemState == State.ShippedByDistributor);
  _;
}
// State : 9
modifier purchasedByRetailer(uint _upc) {
  require(items[_upc].itemState == State.PurchasedByRetailer);
  _;
}
// State : 10
modifier receivedByRetailer(uint _upc) {
  require(items[_upc].itemState == State.ReceivedByRetailer);
  _;
}
// State : 11
modifier forSaleByRetailer(uint _upc) {
  require(items[_upc].itemState == State.ForSaleByRetailer);
  _;
}
// State : 12
modifier purchasedByConsumer(uint _upc) {
  require(items[_upc].itemState == State.PurchasedByConsumer);
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
event ProduceByFarmer(uint upc);         //1
event ForSaleByFarmer(uint upc);         //2
event PurchasedByDistributor(uint upc);  //3
event ShippedByFarmer(uint upc);         //4
event ReceivedByDistributor(uint upc);   //5
event ProcessedByDistributor(uint upc);  //6
event PackagedByDistributor(uint upc);   //7
event ForSaleByDistributor(uint upc);    //8
event PurchasedByRetailer(uint upc);     //9
event ShippedByDistributor(uint upc);    //10
event ReceivedByRetailer(uint upc);      //11
event ForSaleByRetailer(uint upc);       //12
event PurchasedByConsumer(uint upc);     //13
```
