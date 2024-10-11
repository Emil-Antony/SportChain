import { ethers } from "ethers";

export function checkMetaMask() {
	if (typeof window.ethereum !== "undefined") {
		return true;
	} else {
		return false;
	}
}

export async function getConnectedAccount() {
	if (!checkMetaMask()) return;

	try {
		const accounts = await window.ethereum.request({
			method: "eth_accounts",
		});

		// If accounts are connected, set the first one
		if (accounts.length > 0) {
			return accounts[0];
		}
	} catch (error) {
		console.error("Error fetching accounts:", error);
		return;
	}
}

export async function connectToMetaMask() {
	if (!checkMetaMask()) return false;

	try {
		const accounts = await window.ethereum.request({
			method: "eth_requestAccounts",
		});

		if (accounts.length > 0) {
			return true;
		}
		
	} catch (error) {
		console.error("Error connecting to MetaMask", error);
		if (error.code === 4001) {
			console.error("User rejected the request.");
		} return false;
	}
}

export async function getBalance(account: string) {
	if (!checkMetaMask() || !account) return -1;
	try {
		const provider = new ethers.BrowserProvider(window.ethereum);
		const balanceInWei = await provider.getBalance(account);

		// Convert the balance from wei to MATIC
		const balanceInMatic = ethers.formatEther(balanceInWei);
		return balanceInMatic;
	} catch (error) {
		console.error("Error fetching balance:", error);
		return -1;
	}
};

export async function checkChain(chainId: string) {
	const currentChainId = await window.ethereum.request({
		method: "eth_chainId",
		params: [],
	});
	// console.log("Current chain ID:", currentChainId); // Log current chain ID

	if(currentChainId !== chainId) {
		return false
	} else {
		return true
	}
}

export async function switchChain(chainId: string) {
	try {
		await window.ethereum.request({
			method: "wallet_switchEthereumChain",
			params: [{ chainId: `${chainId}` }],
		});
		return 0;
	} catch (error) {
		return error.code;
	}
}

export async function addChain(chainDetails) {
	try {
		await window.ethereum.request({
			method: "wallet_addEthereumChain",
			params: [chainDetails],
		});
		return 0;
	} catch (error) {
		console.error("Error adding network:", error);
		return error.code;
	}
}
