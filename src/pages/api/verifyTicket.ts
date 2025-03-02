import { NextApiRequest, NextApiResponse } from "next";
import { CONTRACT_ADDRESS } from "@/imports/walletdata";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const abi = [
  "function ownerOf(uint256 tokenId) external view returns (address)"
];
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json("Incorrect Method");
  }

  try {
    const { data } = req.body;
    const [walletAddress, ticketId] = data.split(":");

    console.log(`Verifying Ticket ID: ${ticketId} for Wallet: ${walletAddress}`);

    let owner;
    try {
      owner = await contract.ownerOf(ticketId);
    } catch (error) {
      console.error("Token does not exist");
      return res.status(400).json("reject"); // Token not minted, reject
    }

    if (owner.toLowerCase() === walletAddress.toLowerCase()) {
      return res.status(200).json("success");
    } else {
      return res.status(400).json("reject");
    }
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json("Failed to verify ownership");
  }
}
