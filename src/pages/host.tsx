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
import { createevent } from "@/imports/apitest";
import { ADMIN_WALLET } from "@/imports/walletdata";
import { fetchEventCreators } from "@/imports/adminFns";

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

const Host: React.FC = () => {
    const [eventName, setEventName] = useState<string>("");
    const [eventCost, setEventCost] = useState<number | string>("");
    const [ticketNumber, setTicketNumber] = useState<number | string>("");
    const [eventDate, setEventDate] = useState<string>("");
    const [eventTime, setEventTime] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [account, setAccount] = useState<string | null>(null);
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);
    const [balance, setBalance] = useState<number>(0);
    const [provider,setProvider] = useState<ethers.BrowserProvider | null>(null)
    const [sportNFT, setsportNFT] = useState<ethers.Contract | null>(null)
    const [occasions,setOccasion] = useState<any>([])
    const [isModalOpen,setIsModalOpen] = useState<boolean>(false)
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

    useEffect(() => {
        setIsMetaMaskInstalled(checkMetaMask());
        setContracts();
    }, []);

    useEffect(() => {
        (async () => {
          const connectedAcc = await getConnectedAccount();
    
          if (typeof connectedAcc !== "undefined") {
            const hosts = await fetchEventCreators();
            if(!hosts.some(host => host.address === connectedAcc)){
              router.push("/dash");
            }
            setAccount(connectedAcc);
          }else{
            router.push("/");
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

    const openModal = () => {
        setIsModalOpen(true);
      };
    
      const closeModal = () => {
        setIsModalOpen(false);
      };
    
    const handleCreateEvent = () => {
    const eventData = {
        eventName,
        eventCost,
        ticketNumber,
        eventDate,
        eventTime,
        location,
    };
    createevent(eventData.eventName, eventData.eventCost, eventData.ticketNumber, eventData.eventDate, eventData.eventTime, eventData.location);
    closeModal();
    };

    return(
        <div>
            <div className="mb-3">
                <nav className="dark:bg-black fixed w-full z-20 top-0 start-0 border-b border-gray-600 ">
                    <div className="max-w-screen flex flex-wrap items-center justify-between p-4">
                    <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse"> 
                        <span className="my-1 text-white px-3 py-1">Account:</span>
                        <a className="truncate w-40 my-1 bg-gray-800 text-white px-3 py-1 rounded-full border border-gray-600"
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content={`Balance: ${balance} GO`}
                        data-tooltip-place="bottom-start"
                        >      
                        {account}
                        </a> 
                        <Tooltip id="my-tooltip" />
                    </div>
                    <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-sticky">
                        <img src="/logo.png" className="w-12 h-auto ms-4" alt="Logo" />
                        <img src="/logotxt.png" className="w-44 h-auto" alt="Logo" />
                    </div>
                    </div>
                </nav>
            </div>
            <div className="flex mt-24 mb-3 w-full">
                <div className="flex flex-row items-center justify-between w-full rounded text-sm font-semibold pb-2 px-20">
                    <div className="bg-transparent w-fit h-full p-1.5">
                    <h1 className="font-extrabold text-transparent text-xl sm:text-4xl xl:text-4xl ms-8 bg-clip-text bg-white">
                        List Events
                    </h1>
                    </div>
                    <button onClick={openModal}
                    className="text-lg me-8 rounded-full w-12 h-12 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 
                                shadow-lg text-white font-semibold transition-transform duration-300 hover:scale-110 hover:shadow-xl
                                flex-shrink-0"
                    >
                    +
                    </button>
                </div>
            </div>

            <div style={{height: '1px'}} className=" bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
            <div className="text-white p-10">
                {
                    occasions.map((occasion, i) => (
                    <div key={i} className="p-6 mb-4 mx-20  bg-gray-900 rounded-lg shadow-lg hover:bg-gray-800 ">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col justify-center">
                                <p className="text-lg font-semibold">{occasion.date}</p>
                                
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold">{occasion.name}</p>
                                <p className="text-sm text-gray-400">{occasion.location}</p>
                            </div>
                            <div className="text-right">
                                <p className=" text-white-400 font-semibold">{occasion.time}</p>
                            </div>
                        </div>
        
                    </div>
                    ))
                }
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-slate-900 p-8 rounded-lg w-96 max-w-lg shadow-lg">
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-semibold text-white-800">Create New Event</h2>
                    <button
                    onClick={closeModal}
                    className="text-xl font-bold text-gray-600 transition-colors duration-300 hover:text-white focus:outline-none"
                    >
                    &times;
                    </button>
                    </div>

                    {/* Event Form */}
                    <div>
                    <input
                        type="text"
                        placeholder="Event Name"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        className="mt-2 p-3 w-full border text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="number"
                        placeholder="Event Cost"
                        value={eventCost}
                        onChange={(e) => setEventCost(e.target.value)}
                        className="mt-4 p-3 w-full text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="number"
                        placeholder="Ticket Number"
                        value={ticketNumber}
                        onChange={(e) => setTicketNumber(e.target.value)}
                        className="mt-4 p-3 w-full border text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="mt-4 p-3 w-full border text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="text"
                        placeholder="Time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="mt-4 p-3 w-full border text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="text"
                        placeholder="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="mt-4 p-3 w-full border text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    {/* Create Event Button */}
                    <button 
                    onClick={handleCreateEvent}
                    className="mt-6 p-3 w-full bg-green-500 text-white rounded-lg font-semibold shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400">
                        Create Event
                    </button>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
};

export default Host;