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
import { PlusCircle, Trash2, Award, Users } from 'lucide-react';
import AddHost from "./components/addhost";
import AddReward from "./components/addReward";
import { amoyTestnetParams, ADMIN_WALLET, CONTRACT_ADDRESS } from "@/imports/walletdata";
import { fetchEventCreators, addEventCreator, deleteEventCreator} from "@/imports/adminFns"
import { fetchAllRewards, addNewReward,deleteReward } from "@/imports/rewardFns";

const Admin: React.FC = () => {
    const [account, setAccount] = useState<string | null>(null);
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);
    const [balance, setBalance] = useState<number>(0);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [sportNFT, setSportNFT] = useState<ethers.Contract | null>(null);
    const [hosts, setHosts] = useState<{ name: string; address: string }[]>([]);
    const [rewards, setRewards] = useState<any[]>([]);
    const [hostModal, setHostModal] = useState<boolean>(false);
    const [rewardModal, setRewardModal] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'hosts' | 'rewards'>('hosts');

    const router = useRouter();
    
    async function setContracts(){
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        const sportNFTs = new ethers.Contract(CONTRACT_ADDRESS, sportnftabi, provider);
        setSportNFT(sportNFTs);
    }
    
    function goHome(){  
        router.push("/");
    }

    function openAddHost(){
        setHostModal(true);
    }

    function closeAddHost(){
      setHostModal(false);
    }

    function openReward(){
      setRewardModal(true);
    }

    function closeReward(){
      setRewardModal(false);
    }

    const handleSubmit = async (newhost:any) => {
      if (!newhost.name || !newhost.address) return;
      try {
        const name = newhost.name;
        const address = newhost.address.toLowerCase();
        await addEventCreator({name, address});
        setHosts([...hosts, {name, address}]); // Update UI
      } catch (error) {
        alert(error.message);
      }
    };

    const handleSubmitReward =async(newreward:any) =>{
      console.log(newreward)
      const name= newreward.name;
      const price = newreward.cost;
      await addNewReward(newreward);
      setRewards((prevRewards) => [...prevRewards, {name,price}]);
    }

    const deleteHost = async (address: string) => {
      const isConfirmed = window.confirm("Are you sure you want to delete this host?");
      if (!isConfirmed) {
        return; // If user cancels, do nothing
      }
      try{
        await deleteEventCreator(address);
        setHosts(hosts.filter((host) => host.address !== address));
      } catch(error){
        alert(error.message);
      }
    }

    const removeReward = async (name: string) => {
      const confirm = window.confirm("Do you want to remove this reward?");
      if(!confirm){
        return
      }
      await deleteReward(name);
      setRewards((prevRewards) => prevRewards.filter((reward) => reward.name !== name))
    };
    
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
        fetchAllRewards().then((data) => {setRewards(data);});
        setIsMetaMaskInstalled(checkMetaMask());
        setContracts();
    }, []);

    useEffect(() => {
        (async () => {
          const connectedAcc = await getConnectedAccount();
          if (typeof connectedAcc !== "undefined") {
            if(connectedAcc !== ADMIN_WALLET){
                const fetchedhosts = await fetchEventCreators();
                if(fetchedhosts.some(host => host.address.toLowerCase() === connectedAcc.toLowerCase())){
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
          <nav className="dark:bg-black fixed w-full z-20 top-0 start-0 border-b border-gray-600">
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
              
              {/* Tabs */}
              <div className="flex border-b border-gray-700 mb-6">
                <button
                  className={`flex items-center px-6 py-3 font-medium text-sm transition-colors ${
                    activeTab === 'hosts' 
                      ? 'text-green-400 border-b-2 border-green-400' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('hosts')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Event Creators
                </button>
                <button
                  className={`flex items-center px-6 py-3 font-medium text-sm transition-colors ${
                    activeTab === 'rewards' 
                      ? 'text-green-400 border-b-2 border-green-400' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('rewards')}
                >
                  <Award className="w-4 h-4 mr-2" />
                  Rewards
                </button>
              </div>
              
              {/* Host Management Tab */}
              {activeTab === 'hosts' && (
                <div className="bg-black rounded-xl border border-gray-800 shadow-lg overflow-hidden">
                  <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-white">Event Creators</h2>
                        <div className="h-1 w-16 bg-gradient-to-r from-green-400 to-green-600 mt-2"></div>
                      </div>
                      <button 
                        onClick={openAddHost}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Add New Host</span>
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 p-1">
                    <div className="space-y-2 p-3">
                      {hosts.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          No event creators found. Add one to get started.
                        </div>
                      ) : (
                        hosts.map(({address, name}, index) => (
                          <div 
                            key={index}
                            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300 border border-gray-700 hover:border-gray-600"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="text-white font-medium mb-1">{name}</div>
                                  <div className="text-gray-400 font-mono text-xs truncate max-w-xs">
                                    {address}
                                  </div>
                                </div>
                              </div>

                              <button 
                                className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
                                onClick={() => deleteHost(address)}
                                title="Delete host"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-900 px-6 py-3 border-t border-gray-700 text-xs text-gray-400">
                    Total: {hosts.length} event creators
                  </div>
                </div>
              )}
              
              {/* Rewards Tab */}
              {activeTab === 'rewards' && (
                <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg overflow-hidden">
                  <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-white">Manage Rewards</h2>
                        <div className="h-1 w-16 bg-gradient-to-r from-green-400 to-green-600 mt-2"></div>
                      </div>
                      <button 
                        
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                        onClick={openReward}
                        >
                        
                        <PlusCircle className="w-4 h-4" />
                        <span>New Reward</span>
                      </button>
                    </div>
                  </div>
                  {/* Rewards List */}
                  <div className="max-h-96 overflow-y-auto scrollbar-thin bg-black scrollbar-thumb-gray-700 scrollbar-track-gray-900 p-1">
                    <div className="space-y-2 p-3">
                      {rewards.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          No rewards available.
                        </div>
                      ) : (
                        rewards.map(({ name, price }, index) => (
                          <div 
                            key={index}
                            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300 border border-gray-700 hover:border-gray-600"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="text-white font-medium mb-1">{name}</div>
                                  <div className="text-gray-400 font-mono text-xs">
                                    Price: {price} GC
                                  </div>
                                </div>
                              </div>

                              <button 
                                className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
                                onClick={() => removeReward(name)}
                                title="Remove reward"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-800 px-6 py-3 border-t border-gray-700 text-xs text-gray-400">
                    Total: {rewards.length} rewards
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {hostModal && (
          <AddHost 
            isOpen={hostModal} 
            onClose={closeAddHost} 
            onSubmit={handleSubmit}
          />
        )}
        {rewardModal && (
          <AddReward 
            isOpen={rewardModal} 
            onClose={closeReward} 
            onSubmit={handleSubmitReward}
          />
        )}
      </div>
    );
};

export default Admin;