import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

// Define file path
const filePath = path.join(process.cwd(), "public", "eventCreators.json");

// Helper function to read data from JSON
const readData = () => {
  const fileData = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileData);
};

// Helper function to write data to JSON
const writeData = (data: any) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Fetch event creators
    const data = readData();
    res.status(200).json(data);
  } else if (req.method === "POST") {
    // Add new event creator
    const data = readData();
    const newHost = req.body;

    // Check if the host already exists
    if (data.some((host: any) => host.address === newHost.address)) {
      return res.status(400).json({ message: "Host already exists" });
    }

    data.push(newHost);
    writeData(data);
    res.status(201).json({ message: "Host added successfully", newHost });
  } else if (req.method === "DELETE") {
    // Remove event creator
    const { address } = req.body;
    let data = readData();

    data = data.filter((host: any) => host.address !== address);
    writeData(data);

    res.status(200).json({ message: "Host removed successfully" });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
