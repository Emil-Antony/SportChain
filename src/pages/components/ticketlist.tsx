import {ethers} from "ethers";
import { CONTRACT_ADDRESS } from "@/imports/walletdata";
import sportnftabi from '@/abis/sportnft.json';
import React, {useEffect, useState} from "react";
import Ticket from "./ticket";
import Chatbox from "./Chatbox";

export interface nftjson {
    name: string,
    image: string,
    desc: string,
    location: string,
    date: string,
    id: number
}

export default function TicketList({account}:{account:string}){
  const [balance,setBalance]= useState<ethers.BigNumber|null>(null);
  const [contract,setContract]= useState<ethers.Contract|null>(null);
  const [ownedNFTs,setOwnedNFTs]= useState<Array<nftjson>|null>(null);
  const [isModalOpen,setIsModalOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<nftjson | null>(null);
  const [modalAnimation, setModalAnimation] = useState<string>('opacity-0 scale-95');
  const [isChatOpen, setIsChatOpen] = useState(false);

  
  const openModal = (ticket: nftjson) => {
      setIsModalOpen(true);
      setSelectedTicket(ticket);
  };
  
  const closeModal = () => {
      setModalAnimation('opacity-0 scale-95'); // Close animation
      setTimeout(() => {
          setIsModalOpen(false);
          setSelectedTicket(null);
      }, 300); // Match the duration of the fade-out animation
  };

  const openChat = () => {
      setIsChatOpen(true);
    };
  
    const closeChat = () => {
      setIsChatOpen(false);
    };

  const writeNFC = async () => {
    console.log(account);
    console.log(selectedTicket?.id);
    const id = selectedTicket.id;
    try{
      const response = await fetch('/api/writenfc',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',  // Setting the content type to JSON
        },
        body: JSON.stringify({account,id}),  // Sending data as a JSON string
      });
      const data = await response.json();
      console.log(data);
    }catch (error){
        console.error(error);
    }
  }

  useEffect(() => {
      if (isModalOpen) {
          setModalAnimation('opacity-100 scale-100'); // Open animation
      }
  }, [isModalOpen]);

  useEffect(()=>{
      console.log("rerendered");
      const provider = new ethers.BrowserProvider(window.ethereum);  // v6 syntax for provider
      const nftcontract = new ethers.Contract(CONTRACT_ADDRESS, sportnftabi, provider);
      setContract(nftcontract);
      (async()=>{
          const bal =  await nftcontract.balanceOf(account);
          setBalance(Number(bal));
      })();
  },[])

  useEffect(()=>{
      if(balance != null && contract != null){
          console.log("tokens: ",balance);
          // Get the token ID of each NFT owned by the user
          (async()=>{
              const NFTs = [];
              for (let i = 0; i < Number(balance); i++) {
              const tokenId = await contract.tokenOfOwnerByIndex(account, i);
              const tokenURI = await contract.tokenURI(tokenId);
              console.log(tokenURI);
              const response = await fetch(tokenURI);
              const metadata = await response.json();
              const name = metadata.name;
              const desc = metadata.description;
              const image = metadata.image;
              const location = metadata.attributes.find(attr => attr.trait_type === "Location")?.value;
              const date = metadata.attributes.find(attr => attr.trait_type === "Date")?.value;
              const tokenidnum = Number(tokenId); // the number version of tokenid
              const ticketdata = {name: name ,desc: desc ,image: image ,location: location ,date: date, id: tokenidnum};
              NFTs.push(ticketdata);
              }
              setOwnedNFTs(NFTs);
              console.log(ownedNFTs);
          })();
      }
  },[balance,contract])

  return (
    <div className="flex justify-center p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-20">
        {ownedNFTs && ownedNFTs.length > 0  ? (
          ownedNFTs.map((nft, index) => (
            <div onClick={() => openModal(nft)} className="group">
              <Ticket data={nft} key={index} />
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No NFTs owned</p>
        )}
      </div>
      {isModalOpen && selectedTicket && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-300 ${modalAnimation}`}
        >
          <div className="bg-[#0a0813] p-8 rounded-xl w-96 max-w-lg shadow-2xl transform transition-transform duration-500 animate-scaleUp">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold text-white text-center w-full">{selectedTicket.name}</h2>
              <button
                onClick={closeModal}
                className="text-xl font-bold text-white transition-colors duration-300 hover:text-[#fd3980] focus:outline-none absolute top-4 right-4"
              >
                &times;
              </button>
            </div>

            {/* Ticket Description */}
            <p className="text-white mb-4">{selectedTicket.desc}</p>

            {/* Ticket Location */}
            <p className="text-white text-lg italic mb-2 text-center">{selectedTicket.location}</p>

            {/* Ticket Date */}
            <p className="text-white text-lg text-center">{selectedTicket.date}</p>

            {/* Buttons Section */}
            <div className="flex justify-between mt-8 items-center">
              <button className="relative inline-block text-lg ms-12 group"
              onClick={writeNFC}>
                <span className="relative z-10 block px-5 py-3 overflow-hidden font-medium leading-tight text-black transition-colors duration-300 ease-out border-2 border-[#fd3980] rounded-lg group-hover:text-white">
                  <span className="absolute inset-0 w-full h-full px-5 py-3 rounded-lg bg-[#fd3980]"></span>
                  <span className="absolute left-0 w-48 h-48 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-[#0f1a58] group-hover:-rotate-180 ease"></span>
                  <span className="relative">NFC</span>
                </span>
                <span className="absolute bottom-0 right-0 w-full h-12 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-[#0f1a58] rounded-lg group-hover:mb-0 group-hover:mr-0" data-rounded="rounded-lg"></span>
              </button>

              <button
                className="relative inline-block text-lg me-12 group"
                onClick={() => openChat(selectedTicket)}
              >
                <span className="relative z-10 block px-5 py-3 overflow-hidden font-medium leading-tight text-black transition-colors duration-300 ease-out border-2 border-[#fd3980] rounded-lg group-hover:text-white">
                  <span className="absolute inset-0 w-full h-full px-5 py-3 rounded-lg bg-[#fd3980]"></span>
                  <span className="absolute left-0 w-48 h-48 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-[#0f1a58] group-hover:-rotate-180 ease"></span>
                  <span className="relative">Chat</span>
                </span>
                <span className="absolute bottom-0 right-0 w-full h-12 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-[#0f1a58] rounded-lg group-hover:mb-0 group-hover:mr-0" data-rounded="rounded-lg"></span>
              </button>
            </div>
          </div>
        </div>
      )}
      {isChatOpen && (
          <Chatbox selectedTicket={selectedTicket} closeChat={closeChat} />
      )}
    </div>
  );
}