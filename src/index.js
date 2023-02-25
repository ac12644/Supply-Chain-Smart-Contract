import React, { useState, useEffect } from "react";
import MyContract from "../../build/contracts/SupplyChain.json";
import Web3 from "web3";

/*
Please note that this code is intended only for utilizing the functions 
of a smart contract and is not a fully functional front end. It is meant 
to be integrated with a front-end framework to provide a complete 
user interface for the DApp. This code includes basic functionality for 
interacting with the smart contract using Web3.js library and can be used 
as a starting point for building the front-end application. However, additional 
UI elements and logic will need to be implemented to create a complete DApp user interface.
*/

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      try {
        await loadWeb3();
        await loadBlockchainData();
      } catch (error) {
        console.error("Error initializing the app:", error);
      }
    };
    init();
  }, []);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
      } catch (error) {
        console.error("Error loading Web3:", error);
      }
    } else {
      console.error("MetaMask not found");
    }
  };

  const loadBlockchainData = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = MyContract.networks[networkId];
      const contractInstance = new web3.eth.Contract(
        MyContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      setContract(contractInstance);
    } catch (error) {
      console.error("Error loading blockchain data:", error);
    }
  };

  async function addRole(role, address) {
    try {
      const hasRole = await contract[`is${role}`](address);
      if (!hasRole) {
        await contract[`add${role}`](address);
      }
    } catch (error) {
      console.error(`Error adding ${role} role for ${address}: ${error}`);
      throw error;
    }
  }

  const harvestItem = async (
    productCode,
    farmName,
    farmInformation,
    farmLatitude,
    farmLongitude,
    productNotes,
    productPrice
  ) => {
    try {
      const item = await contract.produceItemByFarmer(
        productCode,
        farmName,
        farmInformation,
        farmLatitude,
        farmLongitude,
        productNotes,
        productPrice
      );
      return item;
    } catch (error) {
      console.error(
        `Failed to harvest item with product code ${productCode}:`,
        error
      );
      throw error;
    }
  };
  async function sellItem(productCode, price, role) {
    try {
      const sell = await contract[`sellItemBy${role}`](productCode, price);
      return sell;
    } catch (error) {
      console.error(
        `Failed to sell item with productCode ${productCode} and price ${price} as ${role}:`,
        error
      );
      throw error;
    }
  }

  async function purchaseItem(productCode, role) {
    try {
      await contract[`purchaseItemBy${role}`](productCode);
    } catch (error) {
      console.error(
        `Failed to purchase item with productCode ${productCode} as ${role}:`,
        error
      );
      throw error;
    }
  }

  async function shipItem(productCode, role) {
    try {
      await contract[`shippedItemBy${role}`](productCode);
    } catch (error) {
      console.error(
        `Failed to ship item with productCode ${productCode} as ${role}:`,
        error
      );
      throw error;
    }
  }

  async function packageItemByDistributor(productCode) {
    try {
      await contract.packageItemByDistributor(productCode);
    } catch (error) {
      console.error(
        `Failed to package item with productCode ${productCode}:`,
        error
      );
      throw error;
    }
  }

  const fetchItemBufferOne = async (productCode) => {
    try {
      const item = await contract.fetchItemBufferOne.call(productCode);
      return item;
    } catch (error) {
      console.error(
        `Error fetching item buffer one for product code ${productCode}:`,
        error
      );
      throw error;
    }
  };

  const fetchItemBufferTwo = async (productCode) => {
    try {
      const item = await contract.fetchItemBufferTwo.call(productCode);
      return item;
    } catch (error) {
      console.error(
        `Error fetching item buffer two for product code ${productCode}:`,
        error
      );
      throw error;
    }
  };

  const fetchItemHistory = async (productCode) => {
    try {
      const history = await contract.fetchItemHistory.call(productCode);
      return history;
    } catch (error) {
      console.error(
        `Error fetching item history for product code ${productCode}:`,
        error
      );
      throw error;
    }
  };

  return (
    <div>
      <h1>Supply Chain</h1>
      <div class="container">
        <div class="box">
          <p>
            Farmer creates a product and lists it to be purchased by Distributor
          </p>
        </div>
        <div class="arrow"></div>
        <div class="box">
          <p>Farmer ships the product</p>
        </div>
        <div class="arrow"></div>
        <div class="box">
          <p>
            Distributor receives the product, process it, package it and put it
            on sale
          </p>
        </div>
        <div class="arrow"></div>
        <div class="box">
          <p>Retailer buys the product from Distributor</p>
        </div>
        <div class="arrow"></div>
        <div class="box">
          <p>Distributor ships the product to Retailer</p>
        </div>
        <div class="arrow"></div>
        <div class="box">
          <p>Retailer receives the product and put it on sale</p>
        </div>
        <div class="arrow"></div>
        <div class="box">
          <p>Consumer purchase the product</p>
        </div>
      </div>
    </div>
  );
}
export default App;
