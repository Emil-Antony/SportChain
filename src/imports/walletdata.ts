export const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
export const ADMIN_WALLET ="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266".toLowerCase();
export let EVENTCREATORS = [{address:"0x90F79bf6EB2c4f870365E785982E1f101E93b906".toLowerCase(),name:"Host 1"}];
export const amoyTestnetParams = {
    chainId: "0x7A69",
    chainName: "Local Hardhat Network",
    rpcUrls: ["http://127.0.0.1:8545/"],
    nativeCurrency: {
      name: "GO",
      symbol: "GO",
      decimals: 18,
    },
    blockExplorerUrls: [],
  };

  export const addEventCreator = (newHost) => {
    EVENTCREATORS = [...EVENTCREATORS, newHost];
    localStorage.setItem("eventCreators", JSON.stringify(EVENTCREATORS)); // Save to localStorage
  };//for adding more host