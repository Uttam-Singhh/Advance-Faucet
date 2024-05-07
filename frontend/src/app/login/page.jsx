"use client";
import React, { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import "./styles.css"; // Import your CSS file

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

  return (
    <div className="container">
      <div className="login-container">
        {status === "loading" && <p className="loading">Loading...</p>}
        {status === "authenticated" && (
          <>
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
              <button className="textbox-button" disabled={!isValid}>
                Receive Tokens
              </button>
            </div>
            <button onClick={() => signOut()} className="logout-button">
              Logout
            </button>
          </>
        )}
        {status !== "authenticated" && (
          <button onClick={() => signIn("twitter")} className="signin-button">
            Sign In with Twitter
          </button>
        )}
      </div>
    </div>
  );
};

export default Login;
