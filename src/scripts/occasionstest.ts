const { ethers } = require("ethers");
const nftabi = require("../abis/sportnft.json");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
    const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
    const sportNFT = new ethers.Contract("0x5fbdb2315678afecb367f032d93f642f64180aa3", nftabi, signer);
    const occasionId = await sportNFT.getOccasionID("Match 1");
    console.log(Number(occasionId));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});