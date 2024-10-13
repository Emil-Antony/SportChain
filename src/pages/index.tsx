import React, { useEffect, useState } from "react";
import 'react-tooltip/dist/react-tooltip.css'
import { ethers } from "ethers";
import { useRouter } from "next/router";
import {
  checkMetaMask,
  getConnectedAccount,
  checkChain,
  switchChain,
  addChain,
  getBalance,
  connectToMetaMask,
} from "@/imports/ethersfn";
import { MetaSVG } from "@/imports/svg";

const Home: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] =
    useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);

  const amoyTestnetParams = {
    chainId: "0x7A69",
    chainName: "Local Hardhat Network",
    rpcUrls: ["http://127.0.0.1:8545/"],
    nativeCurrency: {
      name: "GO",
      symbol: "GO",
      decimals: 18,
    },
    blockExplorerUrls: [],
  };

  const router = useRouter();

  useEffect(() => {
    setIsMetaMaskInstalled(checkMetaMask());
  }, []);

  // useEffect(() => {
  //   (async () => {
  //     console.log("sharp");
  //     const connectedAcc = await getConnectedAccount();
  //     if (typeof connectedAcc !== "undefined") {
  //       setAccount(connectedAcc);
  //       handleChain();
  //       goDash();
  //     }
  //   })();
  // }, [isMetaMaskInstalled]);

  useEffect(() => {
    balanceUpdate();

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected from MetaMask
        disconnectMetaMask();
      } else {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = async () => {
      // This will be called when the network changes
      handleChain();
      balanceUpdate();
    };

    // Listen for account changes
    if (isMetaMaskInstalled) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    // Cleanup the listeners on component unmount
    return () => {
      if (isMetaMaskInstalled) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [account]);

  const balanceUpdate = async () => {
    const balance = await getBalance(account);
    if (typeof balance !== "undefined") {
      setBalance(balance);
    }
  };

  const goDash = () => {
    router.push("/dash");
  };

  const disconnectMetaMask = () => {
    setAccount(null);
    setBalance(0); // Reset balance when disconnected
  };

  const handleChain = async () => {
    if (!(await checkChain(amoyTestnetParams.chainId))) {
      const errcode = await switchChain(amoyTestnetParams.chainId);

      if (errcode === 4902) {
        addChain(amoyTestnetParams);
      } else if (errcode === 4001) {
        disconnectMetaMask();
      }
    }
  };

  const connectWallet = async () => {
    await handleChain();

    if (!(await connectToMetaMask())) {
      alert("Connecting to wallet failed!");
      return;
    }

    const connectedAcc = await getConnectedAccount();

    if (typeof connectedAcc !== "undefined") {
      setAccount(connectedAcc);
      goDash();
    } else {
      return;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black-100">
      <h1 className="text-2xl text-white mb-4">
        Welcome to{" "}
        <span className="font-extrabold text-transparent text-3xl sm:text-4xl xl:text-5xl bg-clip-text bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-transparent h-full">
          SportChain
        </span>
      </h1>
      {isMetaMaskInstalled ? (
        <>
          {account ? (
            <div className="flex flex-col justify-items-center">
              <p className="mt-4">Connected Account: {account}</p>
              <p className="mt-4">Balance: {balance} MATIC</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={connectWallet}
              class="text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-3 mx-4 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2"
            >
              <MetaSVG />
              Connect with MetaMask
            </button>
          )}
        </>
      ) : (
        <p className="text-red-500">
          MetaMask is not installed. Please install it to continue.
        </p>
      )}
    </div>
  );
};

export default Home;
