import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { GAMECOIN_ADDRESS } from "@/imports/walletdata";
import gamecoinabi from '@/abis/gamecoin.json';

// Define the type for reward items based on your JSON structure
interface RewardItem {
  name: string;
  price: string;
  code: string;
  image?: string; // Making image optional since it's not in your sample data
}


export default function Redeem({ account, gamecoins, refreshBalance }: { account: string; gamecoins: number; refreshBalance: () => Promise<void>;}) {
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [email, setEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  useEffect(() => {
    // Fetch the rewards data
    console.log("number of gamecoins is",gamecoins);
    fetch('/giftcards.json')
      .then(response => response.json())
      .then(data => {
        setRewards(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error loading rewards:", error);
        setLoading(false);
      });
  }, []);


  async function handleRedeem() {


    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(GAMECOIN_ADDRESS, gamecoinabi, signer);

      const tx = await contract.redeemPoints(
        ethers.parseUnits(selectedReward.price.toString(), 18)
      );
      await tx.wait();
      const response = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redeem: true, email, name: selectedReward.name }),
      });
  
      const data = await response.json();
      console.log(data);
      alert("Redeemed successfully!");
      setIsModalOpen(false);
      setEmail("");
      await refreshBalance();
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Redemption failed. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="my-8">
      {/* Rewards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {rewards.map((reward, index) => (
          <div key={index} className="border border-gray-700 p-4 rounded-lg bg-gray-800 text-white shadow-lg">
            {reward.image && (
              <img src={reward.image} alt={reward.name} className="w-full h-40 object-cover rounded-md mb-4" />
            )}
            <h3 className="text-lg text-center font-semibold">{reward.name}</h3>
            <p className="text-gray-400 text-center">Price: {reward.price} GameCoins</p>
            <button
              className={`mt-4 w-full py-2 rounded-md ${
                gamecoins >= parseInt(reward.price) ? "bg-purple-500 hover:bg-purple-600" : "bg-gray-500 cursor-not-allowed"
              }`}
              disabled={gamecoins < parseInt(reward.price)}
              onClick={() => {
                setSelectedReward(reward);
                setIsModalOpen(true);
              }}
            >
              {gamecoins >= parseInt(reward.price) ? "Redeem" : "Not Enough Coins"}
            </button>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold text-white mb-4">
              Enter Your Email
            </h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600"
              placeholder="Enter your email"
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-600 rounded-md text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRedeem}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-md text-white"
              >
                Redeem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}