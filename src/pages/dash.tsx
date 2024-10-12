import React, { useEffect, useState } from "react";
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
import { Tooltip } from 'react-tooltip'

const amoyTestnetParams = {
  chainId: "0x13882",
  chainName: "Polygon Amoy Testnet",
  rpcUrls: ["https://rpc-amoy.polygon.technology/"],
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  blockExplorerUrls: ["https://www.oklink.com/amoy"],
};

export default function Dash() {
  const [account, setAccount] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] =
    useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);

  const router = useRouter();

function goHome (){
  router.push("/");
}
const disconnectMetaMask = () => {
  goHome(); // Reset balance when disconnected
};
const balanceUpdate = async () => {
  const balance = await getBalance(account);
  if (typeof balance !== "undefined") {
    setBalance(balance);
  }
};

  useEffect(() => {
    setIsMetaMaskInstalled(checkMetaMask());
  }, []);

  useEffect(() => {
    (async () => {
      const connectedAcc = await getConnectedAccount();

      if (typeof connectedAcc !== "undefined") {
        setAccount(connectedAcc);
      }
    })();
  }, [isMetaMaskInstalled]);

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

    return (
      <nav className=" dark:bg-black fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
        <div className="max-w-screen flex flex-wrap items-center justify-between  p-4">
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse"> 
          <span className="my-1 text-white px-3 py-1">Account:</span>
          <a className="truncate w-40 my-1 bg-gray-800 text-white px-3 py-1 rounded-full border border-gray-600 "
            data-tooltip-id="my-tooltip"
            data-tooltip-content={`Balance: ${balance} POL`}
            data-tooltip-place="bottom-start"
          >      
            {account}
          </a> 
          <Tooltip id="my-tooltip" />
        </div>
          <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-sticky">
            <img src="/logo.png" className="w-11  h-auto ms-4" alt="Logo" ></img>
            <img src="/logotxt.png" className="w-32 h-auto" alt="Logo" ></img>
          </div>
        </div>
      </nav>

    );
  };