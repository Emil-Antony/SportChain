import { BrowserProvider } from "ethers";
import sportnftabi from '@/abis/sportnft.json';
import { CONTRACT_ADDRESS } from "./walletdata";
import { ethers, JsonRpcSigner } from "ethers"


export const fetchEventCreators = async () => {
    const res = await fetch("/api/eventCreators");
    return res.json();
};

  
export const addEventCreator = async (newCreator: { name: string; address: string }) => {
    const res = await fetch("/api/eventCreators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCreator),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add event creator");
    }else{
        const provider = new BrowserProvider(window.ethereum)
        const signer : JsonRpcSigner = await provider.getSigner();
        const nftcontract = new ethers.Contract(CONTRACT_ADDRESS,sportnftabi,signer)
        nftcontract.setHost(newCreator.address,true);
    }
};

export const deleteEventCreator = async (address: string) => {
    const res = await fetch("/api/eventCreators", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
  
    if (!res.ok) {
      throw new Error("Failed to remove event creator");
    }else{
        const provider = new BrowserProvider(window.ethereum)
        const signer : JsonRpcSigner = await provider.getSigner();
        const nftcontract = new ethers.Contract(CONTRACT_ADDRESS,sportnftabi,signer)
        nftcontract.setHost(address,false);
    }
};
  
  