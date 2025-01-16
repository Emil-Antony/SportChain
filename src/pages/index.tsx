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
import { MetaSVG, SvgMeta } from "@/imports/svg";
import { EVENTCREATORS } from "@/imports/walletdata";

const Home: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] =
    useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);

  const deployeraccounts = ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266".toLowerCase()];

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

  const goHost = () => {
    router.push("/host");
  }

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
      if(EVENTCREATORS.includes(connectedAcc)){
        goHost();
      }
      else{
      goDash();
      }
    } else {
      return;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="p-8 mb-6 mx-6 lg:mx-20 bg-slate-900 rounded-xl shadow-xl transform transition duration-500 hover:scale-105">
        <h1 className="text-3xl text-white mb-6 text-center">
          Welcome to{" "}
          <span className="font-extrabold text-transparent bg-clip-text text-4xl sm:text-5xl xl:text-6xl bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 animate-gradient">
            SportChain
          </span>
        </h1>
  
        {isMetaMaskInstalled ? (
          <>
            {account ? (
              <div className="flex flex-col items-center">
                <p className="text-lg text-gray-200 mt-4">Connected Account:</p>
                <p className="text-xl text-white font-mono">{account}</p>
                <p className="text-lg text-gray-200 mt-4">Balance:</p>
                <p className="text-xl text-white font-mono">{balance} MATIC</p>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={connectWallet}
                  className="flex items-center justify-center px-6 py-3 mt-6 text-lg font-semibold text-gray-900 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-100 focus:ring-4 focus:ring-gray-300 transform transition-all duration-300 hover:scale-105 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                >
                  <MetaSVG className="mr-2" />
                  Connect with MetaMask
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-lg text-red-500 mt-6 text-center">
            MetaMask is not installed. Please install it to continue.
          </p>
        )}
      </div>
    </div>
  );
  
  
};

export default Home;
