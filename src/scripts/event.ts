const { ethers } = require("ethers");
const nftabi = require("../abis/sportnft.json");
const fs = require('fs');
const path = require('path');


const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether');
}

async function main() {
  const args = process.argv.slice(2); // Ignore the first two default arguments (node and filename)
  
  // Ensure the correct number of arguments for each event
  if (args.length % 6 !== 0) {
    console.error("Usage: node event.js <name> <costInEther> <tickets> <date> <time> <location> [repeat for each event]");
    process.exit(1);
  }

  // Build the occasions array from the arguments
  const occasions = [];
  for (let i = 0; i < args.length; i += 6) {
    const name = args[i];
    const cost = tokens(parseFloat(args[i + 1]));
    const tickets = parseInt(args[i + 2]);
    const date = args[i + 3];
    const time = args[i + 4];
    const location = args[i + 5];

    occasions.push({ name, cost, tickets, date, time, location });
  }

  // Deploy contract
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
  const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
  const sportNFT = new ethers.Contract("0x5fbdb2315678afecb367f032d93f642f64180aa3", nftabi, signer);

  // List each event
    const transaction = await sportNFT.connect(signer).list(
      occasions[0].name,
      occasions[0].cost,
      occasions[0].tickets,
      occasions[0].date,
      occasions[0].time,
      occasions[0].location
    );

    await transaction.wait();
    const occasionId = Number(await sportNFT.totalOccasions());
    console.log(occasionId);
    console.log(`Listed Event ${1}: ${occasions[0].name}`);

    const data = {
      name: `${occasions[0].name} Ticket`,
      description: `This NFT represents a ticket for the ${occasions[0].name} sports event.`,
      image: "http://localhost:3000/tokyo.jpg",
      attributes: [
        {
          trait_type: "Location",
          value: `${occasions[0].location}`
        },
        {
          trait_type: "Date",
          value: `${occasions[0].date}`
        }
      ]
    };
    const basedir = path.join(__dirname,'../..')
    const jsonData = JSON.stringify(data, null, 2);
    const directory =  path.join(path.join(basedir,'public'),'nfts');
    const file = path.join(directory,`occasion${occasionId}.json`)
    fs.writeFile(file, jsonData, 'utf8', (err) => {
      if (err) {
        console.error("An error occurred while writing JSON to the file:", err);
        return;
      }
      console.log("JSON file with placeholders created successfully!");
    });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
