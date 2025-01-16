// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {ethers} from "ethers"
import fs from "fs";
import path from "path";

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) { 
  const tokens = (n: number) => {
    return ethers.parseUnits(n.toString(), 'ether');
  };

  if (req.method === 'POST') {
    const eventdata = req.body;
    const date = new Date(eventdata.date);
    const formattedDate = date.toLocaleString("en-US", {
      month: 'short', // 'short' for abbreviated month name
      day: 'numeric', // '2-digit' for two-digit day
    });
    console.log("Formatted date is ",formattedDate);
    const Jsondata = {
      name: `${eventdata.name}`,
      description: `This NFT represents a ticket for the ${eventdata.name} sports event.`,
      image: "http://localhost:3000/new.png",
      attributes: [
        {
          trait_type: "Location",
          value: `${eventdata.location}`
        },
        {
          trait_type: "Date",
          value: `${formattedDate}`
        }
      ]
    };
    console.log("JsonData: ",Jsondata)
    const root = process.cwd();
    const directory = path.join(root, 'public', 'nfts');
    const file = path.join(directory,`occasion${eventdata.occasionId}.json`)
    fs.writeFile(file, JSON.stringify(Jsondata), 'utf8', (err) => {
      if (err) {
        console.error("An error occurred while writing JSON to the file:", err);
        return;
      }
      console.log("JSON file with placeholders created successfully!");
    });

    console.log("recieved data: ",eventdata);
    res.status(200).json({ name: "working!!" });
  }
}