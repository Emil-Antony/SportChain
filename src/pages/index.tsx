"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import {
  checkMetaMask,
  getConnectedAccount,
  checkChain,
  switchChain,
  addChain,
  getBalance,
  connectToMetaMask,
} from "@/imports/ethersfn"
import { ADMIN_WALLET } from "@/imports/walletdata"
import { fetchEventCreators } from "@/imports/adminFns"
import { ShieldCheck, Wallet, Globe, ArrowRight, Zap, Shield, Trophy, Users } from "lucide-react"

const Home: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null)
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false)
  const [balance, setBalance] = useState<number>(0)
  const [hosts, setHosts] = useState<{ name: string; address: string }[]>([])
  const [isConnecting, setIsConnecting] = useState<boolean>(false)

  const amoyTestnetParams = {
    chainId: "0x7A69",
    chainName: "Local Hardhat Network",
    rpcUrls: ["http://127.0.0.1:8545/"],
    nativeCurrency: {
      name: "GO",
      symbol: "GO",
      decimals: 18,
    },
    blockExplorerUrls: [],
  }

  const router = useRouter()

  useEffect(() => {
    try {
      fetchEventCreators().then(setHosts).catch(console.error)
      setIsMetaMaskInstalled(checkMetaMask())
    } catch (error) {
      console.error("Error in initial setup:", error)
    }
  }, [])

  useEffect(() => {
    if (!isMetaMaskInstalled || !account) return

    try {
      balanceUpdate()

      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectMetaMask()
        } else {
          try {
            const accounts = await window.ethereum.request({
              method: "eth_requestAccounts",
            })
            setAccount(accounts[0])
          } catch (error) {
            console.error("Error requesting accounts:", error)
          }
        }
      }

      const handleChainChanged = async () => {
        try {
          handleChain()
          balanceUpdate()
        } catch (error) {
          console.error("Error handling chain change:", error)
        }
      }

      if (window.ethereum) {
        window.ethereum.on("accountsChanged", handleAccountsChanged)
        window.ethereum.on("chainChanged", handleChainChanged)
      }

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    } catch (error) {
      console.error("Error setting up ethereum listeners:", error)
    }
  }, [account, isMetaMaskInstalled])

  const balanceUpdate = async () => {
    try {
      if (!account) return
      const balance = await getBalance(account)
      if (typeof balance !== "undefined") {
        setBalance(balance)
      }
    } catch (error) {
      console.error("Error updating balance:", error)
    }
  }

  const goDash = () => {
    router.push("/dash")
  }

  const goHost = () => {
    router.push("/host")
  }

  const disconnectMetaMask = () => {
    setAccount(null)
    setBalance(0)
  }

  const handleChain = async () => {
    try {
      if (!(await checkChain(amoyTestnetParams.chainId))) {
        const errcode = await switchChain(amoyTestnetParams.chainId)

        if (errcode === 4902) {
          addChain(amoyTestnetParams)
        } else if (errcode === 4001) {
          disconnectMetaMask()
        }
      }
    } catch (error) {
      console.error("Error handling chain:", error)
    }
  }

  const connectWallet = async () => {
    setIsConnecting(true)

    try {
      await handleChain()

      if (!(await connectToMetaMask())) {
        alert("Connecting to wallet failed!")
        return
      }

      const connectedAcc = await getConnectedAccount()

      if (typeof connectedAcc !== "undefined") {
        setAccount(connectedAcc)
        if (connectedAcc === ADMIN_WALLET) {
          router.push("/admin")
        } else if (hosts.some((host) => host.address.toLowerCase() === connectedAcc.toLowerCase())) {
          goHost()
        } else {
          goDash()
        }
      }
    } catch (error) {
      console.error("Connection error:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  // Format account address for display
  const formatAddress = (address: string | null) => {
    if (!address) return ""
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div className="my-8" >
      <div className="fixed inset-0 bg-cover brightness-50 bg-center bg-fixed" style={{ backgroundImage: "url('/background.jpg')", opacity: 0.4}}></div>
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center min-h-screen">
        {/* Hero Section */}
        <div className="bg-black border border-zinc-800 rounded-3xl shadow-xl overflow-hidden opacity-90">
          <div className="p-8 lg:p-12 relative">
            {/* Logo and Title */}
            <div className="text-center mb-12 relative">
              <div className="flex justify-center mb-4">
                <div className="bg-black">
                <img src="/logo.png" className="w-16 h-auto" alt="Logo" />
                </div>
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600 mb-4 tracking-tight">
                SportChain
              </h1>
              <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                Revolutionizing sports event management with blockchain technology
              </p>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800 hover:border-cyan-800 transition-all">
                <div className="bg-black p-3 rounded-lg w-fit mb-4">
                  <Zap className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Fast Transactions</h3>
                <p className="text-zinc-400">Instant ticket purchases and event management with blockchain speed</p>
              </div>

              <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800 hover:border-purple-800 transition-all">
                <div className="bg-black p-3 rounded-lg w-fit mb-4">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Secure Platform</h3>
                <p className="text-zinc-400">Blockchain-backed security ensures tamper-proof event tickets</p>
              </div>

              <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800 hover:border-pink-800 transition-all">
                <div className="bg-black p-3 rounded-lg w-fit mb-4">
                  <Users className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Community Driven</h3>
                <p className="text-zinc-400">Connect with other users in a decentralized ecosystem</p>
              </div>
            </div>

            {/* Wallet Connection Section */}
            <div className="relative z-10">
              {isMetaMaskInstalled ? (
                <div className="space-y-6">
                  {account ? (
                    <div className="bg-zinc-950 rounded-xl p-8 text-center border border-zinc-800">
                      <div className="flex justify-center mb-6">
                        <div className="bg-black p-4 rounded-full border border-green-900/30">
                          <ShieldCheck className="w-12 h-12 text-green-500" />
                        </div>
                      </div>
                      <h2 className="text-2xl font-semibold text-white mb-4">Wallet Connected</h2>
                      <div className="space-y-3 max-w-md mx-auto">
                        <div className="bg-black rounded-lg py-3 px-4 border border-zinc-800">
                          <p className="text-zinc-400 text-sm mb-1">Account</p>
                          <p className="text-white font-mono">{formatAddress(account)}</p>
                        </div>
                        <div className="bg-black rounded-lg py-3 px-4 border border-zinc-800">
                          <p className="text-zinc-400 text-sm mb-1">Balance</p>
                          <p className="text-xl font-bold text-cyan-400">{balance} MATIC</p>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-center">
                        <button
                          onClick={disconnectMetaMask}
                          className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors text-sm"
                        >
                          Disconnect Wallet
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center bg-zinc-950 rounded-xl p-8 border border-zinc-800">
                      <h2 className="text-2xl font-semibold text-white mb-6">Connect to SportChain</h2>
                      

                      <button
                        onClick={connectWallet}
                        disabled={isConnecting}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-700 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg disabled:opacity-70"
                      >
                        {isConnecting ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Wallet className="w-5 h-5" />
                        )}
                        {isConnecting ? "Connecting..." : "Connect Wallet"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <p className="text-neutral-400 mt-4 mb-8 text-center max-w-md">
                        Access exclusive sports events, purchase tickets, and manage your events with blockchain
                        technology
                      </p>
                      <p className="text-neutral-500 mt-6 text-center text-sm">
                        Securely connect with MetaMask to access SportChain
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center bg-black border border-red-900/30 rounded-xl p-8">
                  <div className="flex justify-center mb-6">
                    <div className="bg-zinc-950 p-4 rounded-full border border-red-900/30">
                      <Globe className="w-12 h-12 text-red-500" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-red-300 mb-4">MetaMask Not Installed</h2>
                  <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                    Please install the MetaMask browser extension to access SportChain and connect to the blockchain
                  </p>
                  <a
                    href="https://metamask.io/download.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Install MetaMask
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-zinc-600 text-sm">
              <p>© {new Date().getFullYear()} SportChain. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

