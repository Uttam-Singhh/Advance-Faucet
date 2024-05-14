"use client";
import React, { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { ethers } from "ethers";
import "./styles.css";

const contractAddress = "0x5701665C62eF316Dc8e7464B59226140F782E354";
const contractABI = [
  {
    type: "constructor",
    inputs: [
      { name: "_WETH", type: "address", internalType: "address" },
      { name: "_testUSDC", type: "address", internalType: "address" },
    ],
    stateMutability: "payable",
  },
  { type: "receive", stateMutability: "payable" },
  {
    type: "function",
    name: "CFLR_AMOUNT",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "WETH",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IERC20" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "WETH_AMOUNT",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "drain",
    inputs: [{ name: "_recipient", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "requestTokens",
    inputs: [{ name: "recipient", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setOwner",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "testUSDC",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IERC20" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "testUSDC_AMOUNT",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "updateAmountallowed",
    inputs: [
      { name: "_WETHamount", type: "uint256", internalType: "uint256" },
      { name: "_CFLRamount", type: "uint256", internalType: "uint256" },
      { name: "_testUSDCamount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "FaucetAlert",
    inputs: [
      {
        name: "recipient",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FaucetDrained",
    inputs: [
      {
        name: "recipient",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnerUpdated",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
];

const Login = () => {
  const { data: session, status } = useSession();
  const [ethereumAddress, setEthereumAddress] = useState("");
  const [isValid, setIsValid] = useState(true);

  const handleAddressChange = (event) => {
    const address = event.target.value;
    setEthereumAddress(address);
    validateAddress(address);
  };

  const validateAddress = (address) => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    setIsValid(ethAddressRegex.test(address));
  };

  const requestTokens = async (recipient) => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const transaction = await contract.requestTokens(recipient);
        await transaction.wait();
        console.log("Tokens requested successfully!");
      } else {
        console.log("Metamask not detected");
      }
    } catch (error) {
      console.error("Error requesting tokens:", error);
    }
  };

  return (
    <div className="container">
      <div className="login-container">
        <h2 className="title">Welcome to Advance Faucet</h2>
        {status === "loading" && <p className="loading">Loading...</p>}
        {status === "authenticated" && (
          <div className="authenticated-container">
            <p className="welcome">Welcome, {session.user?.name}!</p>
            <div className="textbox-container">
              <p className="textbox-label">
                Enter your Ethereum address to receive tokens:
              </p>
              <input
                type="text"
                placeholder="0x5a84969bb663fb64f6d015dcf9f622aedc796750"
                className={`textbox ${!isValid ? "invalid" : ""}`}
                value={ethereumAddress}
                onChange={handleAddressChange}
              />
              {!isValid && (
                <p className="error-message">Invalid Ethereum address</p>
              )}
            </div>
            <div className="button-container">
              <button
                className="textbox-button"
                disabled={!isValid}
                onClick={() => requestTokens(ethereumAddress)}
              >
                Receive Tokens
              </button>
              <button onClick={() => signOut()} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        )}
        {status !== "authenticated" && (
          <div className="signin-container">
            <button onClick={() => signIn("twitter")} className="signin-button">
              <span className="icon"></span>
              Sign In with Twitter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
