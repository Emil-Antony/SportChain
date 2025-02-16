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
} from "@/imports/ethersfn";
import { Tooltip } from 'react-tooltip';
import sportnftabi from '@/abis/sportnft.json';
import { PlusCircle, Trash2 } from 'lucide-react';
import AddHost from "./components/addhost";
import { amoyTestnetParams, ADMIN_WALLET, EVENTCREATORS } from "@/imports/walletdata";
import { fetchEventCreators, addEventCreator, deleteEventCreator} from "@/imports/adminFns";

const Admin: React.FC = () => {

    const [account, setAccount] = useState<string | null>(null);
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);
    const [balance, setBalance] = useState<number>(0);
    const [provider,setProvider] = useState<ethers.BrowserProvider | null>(null)
    const [sportNFT, setsportNFT] = useState<ethers.Contract | null>(null)
    const [hosts, setHosts] = useState<{ name: string; address: string }[]>([]);
    const [hostModal,setHostModal] = useState<boolean>(false)

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

    function openAddHost(){
        setHostModal(true);
    }

    function closeAddHost(){
      setHostModal(false);
    }

    const handleSubmit = async (newhost) => {
      if (!newhost.name || !newhost.address) return;
      try {
        const name = newhost.name;
        const address = newhost.address.toLowerCase();
        await addEventCreator({name, address});
        setHosts([...hosts, {name,address}]); // Update UI
      } catch (error) {
        alert(error.message);
      }
    };


    const deleteHost = async (address:string) => {
      const isConfirmed = window.confirm("Are you sure you want to delete this host?");
      if (!isConfirmed) {
        return; // If user cancels, do nothing
      }
      try{
        await deleteEventCreator(address);
        setHosts(hosts.filter((host) => host.address !== address));
      }catch(error){
        alert(error.message);
      }
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
        fetchEventCreators().then(setHosts);
        setIsMetaMaskInstalled(checkMetaMask());
        setContracts();
        
    }, []);

    useEffect(() => {
        (async () => {
          const connectedAcc = await getConnectedAccount();
          if (typeof connectedAcc !== "undefined") {
            if(connectedAcc !== ADMIN_WALLET){
                const fetchedhosts = await fetchEventCreators();
                if(fetchedhosts.some(host => host.address === connectedAcc)){
                    router.push("/host");
                }
                else{
                    router.push("/dash");
                }
            }
            setAccount(connectedAcc);
          }else{
            router.push("/");
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

        <div className="w-full min-h-screen bg-gray-1000 py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Event Creators</h1>
                  <div className="h-1 w-20 bg-gradient-to-r from-green-400 to-green-600"></div>
                </div>
                <button 
                  onClick={openAddHost}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Add New Host</span>
                </button>
              </div>

              <div className="space-y-4">
                {hosts.map(({address, name}, index) => (
                  <div 
                    key={index}
                    className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-all duration-300 border border-gray-800 hover:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white text-sm mb-1">{name}</div>
                          <div className="text-gray-400 font-mono text-sm">
                            {address}
                          </div>
                        </div>
                      </div>

                      <button className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center hover:opacity-80 transitiop:opacity"
                        onClick={() => deleteHost(address)}>
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {hostModal && (
          <AddHost 
          isOpen={hostModal} onClose={closeAddHost}  onSubmit={handleSubmit}
          />
        )}
      </div>
    );
};

export default Admin;