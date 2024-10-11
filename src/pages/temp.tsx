import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { BrowserProvider } from "ethers";

const Home: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0)



  useEffect(() => {
    const checkMetaMask = () => {
      if (typeof window.ethereum !== "undefined") {
        setIsMetaMaskInstalled(true);
      }
    };
    checkMetaMask();
  }, []);

  useEffect(() =>{
    console.log(account);
    const gettheBalance = async () => {
      if (!isMetaMaskInstalled) return;
      try{
        const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/");
        const balanceInWei = await provider.getBalance(account);
        // Convert the balance from wei to MATIC
        const balanceinmatic = ethers.formatEther(balanceInWei);
        setBalance(balanceinmatic);
      }catch (error) {
        console.error("Error fetching balance:", error);
      }
    };
    if(account!=null){
    gettheBalance();
    }
  },[account])

  const signtheMessage = async (useracc: string) => {
    try {
      console.log("after pass",useracc);
      const message = "Sign this message to log in.";
      // Use the `personal_sign` method provided by MetaMask to sign messages
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [useracc, message], // Sign message with the account
      });
      
    } catch (error) {
      // Handle the error (e.g., user rejected the signing request)
      console.error("Error signing message:", error);
      alert("You must sign the message to log in.");
      throw error;
    }
  };

  const checkchain = async (provider: ethers.BrowserProvider) =>{
    const chainId = await window.ethereum.request({
      "method": "eth_chainId",
      "params": [],
     });
    if(chainId!=="0x13882"){
      alert("Please switch to the Amoy Testnet");
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{
            chainId: "0x13882"
          }],
        });
      } catch (error) {
        console.log(error);
        if(error.code==4902){
          console.log("No such chain");
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0x13882",
                chainName: "Polygon Amoy Testnet",
                rpcUrls: [
                  "https://rpc-amoy.polygon.technology/"
                ],
                nativeCurrency: {
                  name: "MATIC",
                  symbol: "MATIC",
                  decimals: 18
                },
                blockExplorerUrls: [
                  "https://www.oklink.com/amoy‍"
                ]
              }],
            });
          }catch(error){
            console.log(error)
          }
        }
        else{
        console.error("Failed to add network:", error);
        alert("User rejected the request.");
        }
        throw error;
      }
    } 
  }


  const connectMetaMask = async () => {
    if (!isMetaMaskInstalled) return;

    try {
      // Request account connection with a prompt
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
      });
      // Check if accounts were returned
      if (accounts.length > 0) {
        const useracc = accounts[0];
        let success= true
        console.log("before pass",useracc);
        try{
          await checkchain();
        }catch{
          success=false
        }
        
          try{
            await signtheMessage(useracc)
          }catch{
            console.log("success is now false");
            success=false
          }
        if(success){
          console.log("success is still",success);
          await setAccount(accounts[0]);
        }
      }
      else {
        console.error("No accounts found");
      }
    } catch (error) {
        console.error("Error connecting to MetaMask", error);
        // Optionally handle specific errors, such as user rejection
        if (error.code === 4001) {
            console.log("User rejected the request.");
        }
    }
  };

  const disconnectMetaMask = () => {
    setAccount(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black-100">
      <h1 className="text-2xl text-white mb-4">MetaMask Authentication</h1>
      {isMetaMaskInstalled ? (
        <>
          {account ? (
            <div className= "flex flex-col justify-items-center">
              <p className="mt-4">Connected Account: {account}</p>
              <p className="mt-4">Balance: {balance} MATIC </p>
              <button onClick={disconnectMetaMask} className="bg-red-500 text-white px-4 self-center py-2 rounded mt-4 ">
                Disconnect MetaMask
              </button>
            </div>
          ) : (
            <button onClick={connectMetaMask} className="bg-blue-500 text-white px-4 py-2 rounded">
              Connect MetaMask
            </button>
          )}
        </>
      ) : (
        <p className="text-red-500">MetaMask is not installed. Please install it to continue.</p>
      )}
    </div>
  );
};

export default Home;
