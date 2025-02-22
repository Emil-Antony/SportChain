import type { NextApiRequest, NextApiResponse } from "next";
import sportnftabi from '@/abis/sportnft.json'
import {ethers} from "ethers"

export default async function getNFTs(
	req: NextApiRequest,
  res: NextApiResponse) 
{ 
	if(req.method === 'GET'){
		const { address } = req.query;

		if (!address) {
      return res.status(400).json({ error: 'Address parameter is required' });
    }

		const provider = new ethers.JsonRpcProvider()
		const sportnft = new ethers.Contract("0x5fbdb2315678afecb367f032d93f642f64180aa3",sportnftabi,provider);

		let nftids = [];

		try {
			const bal = await sportnft.balanceOf(address);
			
			for (let i = 0; i < Number(bal); i++) {
				const tokenId = await sportnft.tokenOfOwnerByIndex(address, i);
				nftids.push(`${address}:${tokenId}`);
			}
		} catch (err) {
			console.log("Error occured during operation: ", err);
			res.status(500).json({ error: 'Internal server error' });
		}

		console.log(nftids);
		res.status(200).json({ nfts: nftids });
	} else {
		res.status(405).json({ error: 'Method Not Allowed' });
	}
}
