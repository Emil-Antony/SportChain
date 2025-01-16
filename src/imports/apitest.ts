import {ethers} from "ethers";
import nftabi from '@/abis/sportnft.json';
import {CONTRACT_ADDRESS} from "@/imports/walletdata"
import { JsonRpcSigner } from "ethers";


const options = {
    month: 'short', // 'short' for abbreviated month name
    day: 'numeric', // '2-digit' for two-digit day
  };

export async function createevent(name:string ,cost: string ,tickets: string, date: string, time: string, location: string) {
    const weicost = ethers.parseUnits(cost,"ether");
    const maxtickets = parseInt(tickets);
    const dateNew = new Date(date)
    const stringDate =  dateNew.toLocaleString('en-US', options);
    console.log(stringDate);
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
    const signer : JsonRpcSigner = await provider.getSigner();
    const sportNFT = new ethers.Contract(CONTRACT_ADDRESS, nftabi, signer);

    const transaction = await sportNFT.connect(signer).list(
        name,
        weicost,
        maxtickets,
        stringDate,
        time,
        location
    );
    await transaction.wait();
    const occasionId = Number(await sportNFT.totalOccasions());
    console.log(occasionId);
    console.log(`Listed Event ${1}: ${name}`);
    const eventData = {
        name,
        date,
        location,
        occasionId
    };

    
    try{
        const response = await fetch('/api/hello',{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',  // Setting the content type to JSON
            },
            body: JSON.stringify(eventData),  // Sending data as a JSON string
          });
        const data = await response.json();
        console.log(data);
    }catch (error){
        console.error(error);
    }
}

