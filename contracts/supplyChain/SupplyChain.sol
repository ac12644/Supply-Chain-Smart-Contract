// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../access/FarmerRole.sol";
import "../access/DistributorRole.sol";
import "../access/RetailerRole.sol";
import "../access/ConsumerRole.sol";
import "../utils/Escrow.sol";
import "../utils/Reputation.sol";

/**
 * @title SupplyChain
 * @dev Enhanced supply chain contract with production-ready features
 */
contract SupplyChain is
    ReentrancyGuard,
    Pausable,
    Ownable,
    FarmerRole,
    DistributorRole,
    RetailerRole,
    ConsumerRole
{
    using Strings for string;

    // Define enum 'State' with the following values:
    enum State {
        ProduceByFarmer, // 0
        ForSaleByFarmer, // 1
        PurchasedByDistributor, // 2
        ShippedByFarmer, // 3
        ReceivedByDistributor, // 4
        ProcessedByDistributor, // 5
        PackageByDistributor, // 6
        ForSaleByDistributor, // 7
        PurchasedByRetailer, // 8
        ShippedByDistributor, // 9
        ReceivedByRetailer, // 10
        ForSaleByRetailer, // 11
        PurchasedByConsumer // 12
    }

    // Optimized struct with packed variables for gas efficiency
    struct Item {
        uint256 stockUnit; // Stock Keeping Unit
        uint256 productCode; // Universal Product Code
        address ownerID; // Current owner
        address farmerID; // Farmer address
        uint256 productID; // Product ID
        uint256 productDate; // Product Date
        uint256 productPrice; // Product Price
        uint256 productSliced; // Parent product
        State itemState; // Product State
        address distributorID; // Distributor address
        address retailerID; // Retailer address
        address consumerID; // Consumer address
        uint256 shippingDeadline; // Shipping deadline
        uint256 receivingDeadline; // Receiving deadline
        bool isExpired; // Expiration status
        string ipfsHash; // IPFS hash for metadata
    }

    // Transaction history struct
    struct Txblocks {
        uint256 FTD; // Farmer to Distributor
        uint256 DTR; // Distributor to Retailer
        uint256 RTC; // Retailer to Consumer
    }

    // Batch operation struct
    struct BatchOperation {
        uint256[] productCodes;
        address operator;
        uint256 timestamp;
        bool isCompleted;
    }

    uint256 private _productCounter;
    uint256 private _batchCounter;

    mapping(uint256 => Item) public items;
    mapping(uint256 => Txblocks) public itemsHistory;
    mapping(uint256 => BatchOperation) public batchOperations;
    mapping(address => uint256[]) public userProducts;
    mapping(address => bool) public verifiedUsers;

    Escrow public escrowContract;
    Reputation public reputationContract;

    uint256 public constant MAX_PRODUCT_PRICE = 1000 ether;
    uint256 public constant MIN_PRODUCT_PRICE = 0.001 ether;
    uint256 public constant DEFAULT_TIMEOUT = 7 days;
    uint256 public constant BATCH_LIMIT = 50;

    State constant defaultState = State.ProduceByFarmer;

    // Events
    event ProduceByFarmer(uint256 indexed productCode, address indexed farmer);
    event ForSaleByFarmer(uint256 indexed productCode, uint256 price);
    event PurchasedByDistributor(uint256 indexed productCode, address indexed distributor);
    event ShippedByFarmer(uint256 indexed productCode);
    event ReceivedByDistributor(uint256 indexed productCode);
    event ProcessedByDistributor(uint256 indexed productCode, uint256 slices);
    event PackagedByDistributor(uint256 indexed productCode);
    event ForSaleByDistributor(uint256 indexed productCode, uint256 price);
    event PurchasedByRetailer(uint256 indexed productCode, address indexed retailer);
    event ShippedByDistributor(uint256 indexed productCode);
    event ReceivedByRetailer(uint256 indexed productCode);
    event ForSaleByRetailer(uint256 indexed productCode, uint256 price);
    event PurchasedByConsumer(uint256 indexed productCode, address indexed consumer);
    event BatchOperationCreated(uint256 indexed batchId, address indexed operator, uint256 productCount);
    event ProductExpired(uint256 indexed productCode);
    event UserVerified(address indexed user, bool verified);

    // Modifiers
    modifier validProductCode(uint256 _productCode) {
        require(_productCode > 0, "Invalid product code");
        require(_productCode <= _productCounter, "Product does not exist");
        _;
    }

    modifier validPrice(uint256 _price) {
        require(_price >= MIN_PRODUCT_PRICE && _price <= MAX_PRODUCT_PRICE, "Invalid price range");
        _;
    }

    modifier notExpired(uint256 _productCode) {
        require(!items[_productCode].isExpired, "Product has expired");
        _;
    }

    modifier withinDeadline(uint256 _productCode) {
        require(block.timestamp <= items[_productCode].shippingDeadline, "Shipping deadline passed");
        _;
    }

    modifier onlyVerifiedUser() {
        require(verifiedUsers[msg.sender], "User not verified");
        _;
    }

    // State modifiers
    modifier producedByFarmer(uint256 _productCode) {
        require(items[_productCode].itemState == State.ProduceByFarmer, "Invalid state");
        _;
    }

    modifier forSaleByFarmer(uint256 _productCode) {
        require(items[_productCode].itemState == State.ForSaleByFarmer, "Invalid state");
        _;
    }

    modifier purchasedByDistributor(uint256 _productCode) {
        require(items[_productCode].itemState == State.PurchasedByDistributor, "Invalid state");
        _;
    }

    modifier shippedByFarmer(uint256 _productCode) {
        require(items[_productCode].itemState == State.ShippedByFarmer, "Invalid state");
        _;
    }

    modifier receivedByDistributor(uint256 _productCode) {
        require(items[_productCode].itemState == State.ReceivedByDistributor, "Invalid state");
        _;
    }

    modifier processByDistributor(uint256 _productCode) {
        require(items[_productCode].itemState == State.ProcessedByDistributor, "Invalid state");
        _;
    }

    modifier packagedByDistributor(uint256 _productCode) {
        require(items[_productCode].itemState == State.PackageByDistributor, "Invalid state");
        _;
    }

    modifier forSaleByDistributor(uint256 _productCode) {
        require(items[_productCode].itemState == State.ForSaleByDistributor, "Invalid state");
        _;
    }

    modifier shippedByDistributor(uint256 _productCode) {
        require(items[_productCode].itemState == State.ShippedByDistributor, "Invalid state");
        _;
    }

    modifier purchasedByRetailer(uint256 _productCode) {
        require(items[_productCode].itemState == State.PurchasedByRetailer, "Invalid state");
        _;
    }

    modifier receivedByRetailer(uint256 _productCode) {
        require(items[_productCode].itemState == State.ReceivedByRetailer, "Invalid state");
        _;
    }

    modifier forSaleByRetailer(uint256 _productCode) {
        require(items[_productCode].itemState == State.ForSaleByRetailer, "Invalid state");
        _;
    }

    modifier purchasedByConsumer(uint256 _productCode) {
        require(items[_productCode].itemState == State.PurchasedByConsumer, "Invalid state");
        _;
    }

    constructor(address _escrowContract, address _reputationContract) Ownable(msg.sender) {
        escrowContract = Escrow(_escrowContract);
        reputationContract = Reputation(_reputationContract);
    }

    /**
     * @dev Set escrow contract address
     */
    function setEscrowContract(address _escrowContract) external onlyOwner {
        escrowContract = Escrow(_escrowContract);
    }

    /**
     * @dev Set reputation contract address
     */
    function setReputationContract(address _reputationContract) external onlyOwner {
        reputationContract = Reputation(_reputationContract);
    }

    /**
     * @dev Verify a user
     */
    function verifyUser(address user) external onlyOwner {
        verifiedUsers[user] = true;
        emit UserVerified(user, true);
    }

    /**
     * @dev Unverify a user
     */
    function unverifyUser(address user) external onlyOwner {
        verifiedUsers[user] = false;
        emit UserVerified(user, false);
    }

    /**
     * @dev Produce item by farmer with IPFS metadata
     */
    function produceItemByFarmer(
        uint256 _productCode,
        string memory _ipfsHash,
        uint256 _price,
        uint256 _shippingDeadline
    )
        external
        onlyFarmer
        onlyVerifiedUser
        validPrice(_price)
        whenNotPaused
        nonReentrant
    {
        require(_shippingDeadline > block.timestamp, "Invalid shipping deadline");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");

        _productCounter++;
        uint256 productCode = _productCounter;

        Item memory newItem = Item({
            stockUnit: productCode,
            productCode: productCode,
            ownerID: msg.sender,
            farmerID: msg.sender,
            productID: productCode,
            productDate: block.timestamp,
            productPrice: _price,
            productSliced: 0,
            itemState: defaultState,
            distributorID: address(0),
            retailerID: address(0),
            consumerID: address(0),
            shippingDeadline: _shippingDeadline,
            receivingDeadline: _shippingDeadline + DEFAULT_TIMEOUT,
            isExpired: false,
            ipfsHash: _ipfsHash
        });

        items[productCode] = newItem;
        userProducts[msg.sender].push(productCode);

        Txblocks memory txBlock = Txblocks({
            FTD: 0,
            DTR: 0,
            RTC: 0
        });
        itemsHistory[productCode] = txBlock;

        emit ProduceByFarmer(productCode, msg.sender);
    }

    /**
     * @dev Sell item by farmer
     */
    function sellItemByFarmer(uint256 _productCode, uint256 _price)
        external
        onlyFarmer
        validProductCode(_productCode)
        producedByFarmer(_productCode)
        notExpired(_productCode)
        withinDeadline(_productCode)
        validPrice(_price)
        whenNotPaused
    {
        require(items[_productCode].farmerID == msg.sender, "Not the farmer");
        require(items[_productCode].ownerID == msg.sender, "Not the owner");

        items[_productCode].itemState = State.ForSaleByFarmer;
        items[_productCode].productPrice = _price;

        emit ForSaleByFarmer(_productCode, _price);
    }

    /**
     * @dev Purchase item by distributor using escrow
     */
    function purchaseItemByDistributor(uint256 _productCode)
        external
        payable
        onlyDistributor
        validProductCode(_productCode)
        forSaleByFarmer(_productCode)
        notExpired(_productCode)
        whenNotPaused
        nonReentrant
    {
        Item storage item = items[_productCode];
        require(msg.value >= item.productPrice, "Insufficient payment");

        // Create escrow
        uint256 escrowId = escrowContract.createEscrow{value: msg.value}(
            _productCode,
            msg.sender,
            item.farmerID,
            item.receivingDeadline
        );

        item.ownerID = msg.sender;
        item.distributorID = msg.sender;
        item.itemState = State.PurchasedByDistributor;
        itemsHistory[_productCode].FTD = block.number;

        userProducts[msg.sender].push(_productCode);

        emit PurchasedByDistributor(_productCode, msg.sender);
    }

    /**
     * @dev Ship item by farmer
     */
    function shippedItemByFarmer(uint256 _productCode)
        external
        onlyFarmer
        validProductCode(_productCode)
        purchasedByDistributor(_productCode)
        notExpired(_productCode)
        whenNotPaused
    {
        require(items[_productCode].farmerID == msg.sender, "Not the farmer");

        items[_productCode].itemState = State.ShippedByFarmer;
        emit ShippedByFarmer(_productCode);
    }

    /**
     * @dev Receive item by distributor
     */
    function receivedItemByDistributor(uint256 _productCode)
        external
        onlyDistributor
        validProductCode(_productCode)
        shippedByFarmer(_productCode)
        notExpired(_productCode)
        whenNotPaused
    {
        require(items[_productCode].ownerID == msg.sender, "Not the owner");

        items[_productCode].itemState = State.ReceivedByDistributor;
        emit ReceivedByDistributor(_productCode);
    }

    /**
     * @dev Process item by distributor
     */
    function processedItemByDistributor(uint256 _productCode, uint256 slices)
        external
        onlyDistributor
        validProductCode(_productCode)
        receivedByDistributor(_productCode)
        notExpired(_productCode)
        whenNotPaused
    {
        require(items[_productCode].ownerID == msg.sender, "Not the owner");

        items[_productCode].itemState = State.ProcessedByDistributor;
        items[_productCode].productSliced = slices;

        emit ProcessedByDistributor(_productCode, slices);
    }

    /**
     * @dev Package item by distributor
     */
    function packageItemByDistributor(uint256 _productCode)
        external
        onlyDistributor
        validProductCode(_productCode)
        processByDistributor(_productCode)
        notExpired(_productCode)
        whenNotPaused
    {
        require(items[_productCode].ownerID == msg.sender, "Not the owner");

        items[_productCode].itemState = State.PackageByDistributor;
        emit PackagedByDistributor(_productCode);
    }

    /**
     * @dev Sell item by distributor
     */
    function sellItemByDistributor(uint256 _productCode, uint256 _price)
        external
        onlyDistributor
        validProductCode(_productCode)
        packagedByDistributor(_productCode)
        notExpired(_productCode)
        validPrice(_price)
        whenNotPaused
    {
        require(items[_productCode].ownerID == msg.sender, "Not the owner");

        items[_productCode].itemState = State.ForSaleByDistributor;
        items[_productCode].productPrice = _price;

        emit ForSaleByDistributor(_productCode, _price);
    }

    /**
     * @dev Purchase item by retailer using escrow
     */
    function purchaseItemByRetailer(uint256 _productCode)
        external
        payable
        onlyRetailer
        validProductCode(_productCode)
        forSaleByDistributor(_productCode)
        notExpired(_productCode)
        whenNotPaused
        nonReentrant
    {
        Item storage item = items[_productCode];
        require(msg.value >= item.productPrice, "Insufficient payment");

        // Create escrow
        uint256 escrowId = escrowContract.createEscrow{value: msg.value}(
            _productCode,
            msg.sender,
            item.distributorID,
            item.receivingDeadline
        );

        item.ownerID = msg.sender;
        item.retailerID = msg.sender;
        item.itemState = State.PurchasedByRetailer;
        itemsHistory[_productCode].DTR = block.number;

        userProducts[msg.sender].push(_productCode);

        emit PurchasedByRetailer(_productCode, msg.sender);
    }

    /**
     * @dev Ship item by distributor
     */
    function shippedItemByDistributor(uint256 _productCode)
        external
        onlyDistributor
        validProductCode(_productCode)
        purchasedByRetailer(_productCode)
        notExpired(_productCode)
        whenNotPaused
    {
        require(items[_productCode].distributorID == msg.sender, "Not the distributor");

        items[_productCode].itemState = State.ShippedByDistributor;
        emit ShippedByDistributor(_productCode);
    }

    /**
     * @dev Receive item by retailer
     */
    function receivedItemByRetailer(uint256 _productCode)
        external
        onlyRetailer
        validProductCode(_productCode)
        shippedByDistributor(_productCode)
        notExpired(_productCode)
        whenNotPaused
    {
        require(items[_productCode].ownerID == msg.sender, "Not the owner");

        items[_productCode].itemState = State.ReceivedByRetailer;
        emit ReceivedByRetailer(_productCode);
    }

    /**
     * @dev Sell item by retailer
     */
    function sellItemByRetailer(uint256 _productCode, uint256 _price)
        external
        onlyRetailer
        validProductCode(_productCode)
        receivedByRetailer(_productCode)
        notExpired(_productCode)
        validPrice(_price)
        whenNotPaused
    {
        require(items[_productCode].ownerID == msg.sender, "Not the owner");

        items[_productCode].itemState = State.ForSaleByRetailer;
        items[_productCode].productPrice = _price;

        emit ForSaleByRetailer(_productCode, _price);
    }

    /**
     * @dev Purchase item by consumer using escrow
     */
    function purchaseItemByConsumer(uint256 _productCode)
        external
        payable
        onlyConsumer
        validProductCode(_productCode)
        forSaleByRetailer(_productCode)
        notExpired(_productCode)
        whenNotPaused
        nonReentrant
    {
        Item storage item = items[_productCode];
        require(msg.value >= item.productPrice, "Insufficient payment");

        // Create escrow
        uint256 escrowId = escrowContract.createEscrow{value: msg.value}(
            _productCode,
            msg.sender,
            item.retailerID,
            item.receivingDeadline
        );

        item.ownerID = msg.sender;
        item.consumerID = msg.sender;
        item.itemState = State.PurchasedByConsumer;
        itemsHistory[_productCode].RTC = block.number;

        userProducts[msg.sender].push(_productCode);

        emit PurchasedByConsumer(_productCode, msg.sender);
    }

    /**
     * @dev Batch operation for multiple products
     */
    function createBatchOperation(uint256[] memory _productCodes)
        external
        onlyOwner
        whenNotPaused
        returns (uint256)
    {
        require(_productCodes.length <= BATCH_LIMIT, "Batch limit exceeded");

        _batchCounter++;
        uint256 batchId = _batchCounter;

        batchOperations[batchId] = BatchOperation({
            productCodes: _productCodes,
            operator: msg.sender,
            timestamp: block.timestamp,
            isCompleted: false
        });

        emit BatchOperationCreated(batchId, msg.sender, _productCodes.length);
        return batchId;
    }

    /**
     * @dev Check and expire products
     */
    function checkExpiredProducts(uint256[] memory _productCodes) external {
        for (uint256 i = 0; i < _productCodes.length; i++) {
            uint256 productCode = _productCodes[i];
            if (block.timestamp > items[productCode].receivingDeadline && !items[productCode].isExpired) {
                items[productCode].isExpired = true;
                emit ProductExpired(productCode);
            }
        }
    }

    /**
     * @dev Fetch item data (optimized)
     */
    function fetchItem(uint256 _productCode)
        external
        view
        validProductCode(_productCode)
        returns (Item memory)
    {
        return items[_productCode];
    }

    /**
     * @dev Fetch item history
     */
    function fetchItemHistory(uint256 _productCode)
        external
        view
        validProductCode(_productCode)
        returns (Txblocks memory)
    {
        return itemsHistory[_productCode];
    }

    /**
     * @dev Get user products
     */
    function getUserProducts(address user) external view returns (uint256[] memory) {
        return userProducts[user];
    }

    /**
     * @dev Get total product count
     */
    function getTotalProductCount() external view returns (uint256) {
        return _productCounter;
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
