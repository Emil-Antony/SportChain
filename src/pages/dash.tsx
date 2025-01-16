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
import { Tooltip } from 'react-tooltip';
import sportnftabi from '@/abis/sportnft.json';
import SeatChart from "./components/seatchart"; 
import TicketList from "./components/ticketlist";

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


export default function Dash() {
  const [account, setAccount] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [provider,setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [sportNFT, setsportNFT] = useState<ethers.Contract | null>(null)
  const [occasions,setOccasion] = useState<any>([])
  const [showModal, setShowModal] = useState<boolean>(false)
  const [selectedOccasion, setSelectedOccasion] = useState<any>(null)
  const [selectedTab, setSelectedTab] = useState<string>("Events")
  const [gameCoins, setGameCoins] = useState<Number>(0)

  const router = useRouter();
async function setContracts(){
  const provider = new ethers.BrowserProvider(window.ethereum);
  setProvider(provider);
  const sportNFTs = new ethers.Contract("0x5fbdb2315678afecb367f032d93f642f64180aa3",sportnftabi,provider);
  setsportNFT(sportNFTs);
}
function goHome (){
  router.push("/");
}
const disconnectMetaMask = () => {
  console.log("disconnectedd");
  goHome(); // Reset balance when disconnected
};
const balanceUpdate = async () => {
  const balance = await getBalance(account);
  if (typeof balance !== "undefined") {
    setBalance(balance);
  }
};

const togglePop = (occasion: any) => {
  setSelectedOccasion(occasion);
  showModal ? setShowModal(false) : setShowModal(true)
};

  useEffect(() => {
    setIsMetaMaskInstalled(checkMetaMask());
    setContracts();
  }, []);

  useEffect(() => {
    (async () => {
      const connectedAcc = await getConnectedAccount();

      if (typeof connectedAcc !== "undefined") {
        setAccount(connectedAcc);
      }
    })();
  }, [isMetaMaskInstalled]);

  useEffect(()=>{
    const handleSetContract = async () =>{
      if(sportNFT){
        console.log("THe contract object is ",sportNFT)
        console.log("Contract address: ",await sportNFT.getAddress());
        const totalOccasions = await sportNFT.totalOccasions();
        console.log({totalOccasions:totalOccasions.toString() });
        const occasions = [];
        for(let i=1; i<=totalOccasions; i++){
          const occa = await sportNFT.getOccasion(i);
          occasions.push(occa);
        }
        setOccasion(occasions);
        for(let i=0 ; i<totalOccasions;i++){
          let cost = ethers.formatEther(occasions[i].cost)
        }
      }
    }
    handleSetContract();
  },[sportNFT])

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
    <div>
      <div className="mb-3">
      <nav className="dark:bg-black fixed w-full z-20 top-0 start-0 border-b border-gray-600">
      <div className="max-w-screen flex items-center justify-between p-4">
        {/* Logo Section */}
        <div className="flex items-center ">
          <img src="/logo.png" className="w-12 h-auto" alt="Logo" />
          <img src="/logotxt.png" className="w-44 h-auto" alt="Logo" />
        </div>

        {/* Nav Buttons Section */}
        <div className="flex space-x-10 ml-6 ms-16">
          <h1>|</h1>
          <button
            onClick={() => setSelectedTab("Events")}
            className="relative text-white font-medium transition-transform duration-300 hover:-translate-y-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-white after:w-full after:scale-x-0 after:origin-center after:transition-transform after:duration-300 hover:after:scale-x-100"
          >
            Events
          </button>
          <button
            onClick={() => setSelectedTab("Tickets")}
            className="relative text-white font-medium transition-transform duration-300 hover:-translate-y-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-white after:w-full after:scale-x-0 after:origin-center after:transition-transform after:duration-300 hover:after:scale-x-100"
          >
            Tickets
          </button>
        </div>

        {/* Spacer for the gap between buttons and account */}
        <div className="flex-grow"></div> {/* Pushes the account section to the right */}

        {/* Account Section */}
        <div className="flex items-center space-x-3 md:space-x-0 rtl:space-x-reverse">
          {/* Add text next to account */}
          <span className="pt-2 text-white px-8 py-1">
            {gameCoins} <img src="/gamecoin.png" alt="Game Coin" className="inline-block h-4 mb-1 w-auto" />
          </span>

          <span className="my-1 text-white px-3 py-1">Account:</span>
          <a
            className="truncate w-40 my-1 bg-gray-800 text-white px-3 py-1 rounded-full border border-gray-600"
            data-tooltip-id="my-tooltip"
            data-tooltip-content={`Balance: ${balance} GO`}
            data-tooltip-place="bottom-start"
          >
            {account}
          </a>
          <Tooltip id="my-tooltip" />
        </div>
      </div>
    </nav>
      </div>
      {/* Centered Title Section */}
      <div className="flex justify-between items-center px-32 mt-28 mb-8">
        <h1 className="font-extrabold text-transparent text-xl sm:text-4xl bg-clip-text bg-white">
          {selectedTab}
        </h1>
        {selectedTab==="Events"?
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search Events..."
            className="w-full py-2 px-4 bg-gray-800 text-white rounded-full border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <svg
            className="absolute right-4 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 10a7 7 0 10-14 0 7 7 0 0014 0z"
            />
          </svg>
        </div>:
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search NFTs..."
            className="w-full py-2 px-4 bg-gray-800 text-white rounded-full border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <svg
            className="absolute right-4 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 10a7 7 0 10-14 0 7 7 0 0014 0z"
            />
          </svg>
        </div>
      }
      </div>


      {/* Conditional Content Rendering */}
      <div style={{height: '1px'}} className="bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
      <div className="text-white p-10">
        {selectedTab === "Events" ? (
          occasions.map((occasion, i) => (
            <div key={i} className="p-6 mb-4 mx-20 bg-gray-900 rounded-lg shadow-lg hover:bg-gray-800">
              <div className="flex justify-between items-center">
                <div className="flex flex-col justify-center">
                  <p className="text-lg font-semibold">{occasion.date}</p>
                  <p className="text-sm text-gray-400">{occasion.time}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">{occasion.name}</p>
                  <p className="text-sm text-gray-400">{occasion.location}</p>
                </div>
                <div className="text-right">
                  {Number(occasion.tickets) > 0 ? (
                    <button
                      className="text-m border border-lg border-transparent rounded p-1 w-20 font-mono bg-green-500 transition duration-200 text-white hover:scale-110 hover:bg-emerald-500"
                      onClick={() => togglePop(occasion)}
                    >
                      {ethers.formatEther(occasion.cost)} ETH
                    </button>
                  ) : (
                    <button className="text-m border border-lg border-transparent rounded p-1 w-20 font-mono bg-red-600 transition duration-200 text-white hover:scale-90 hover:bg-slate-500">
                      Sold Out
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          // You can display the ticket-related content here
          <div className="px-20">
            <TicketList
              account={account}
              />
          </div>
        )}
      </div>
      <div>
        {showModal && (
          <SeatChart
            occasion={selectedOccasion}
            sportNFT={sportNFT}
            setShowModal={setShowModal}
            provider={provider}
          />
        )}
      </div>
    </div>
  );
};