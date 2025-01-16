  import { useEffect, useState } from 'react'
  import { BigNumber, ethers, Contract, BrowserProvider } from "ethers";


  // Import Components
  import Seat from './Seat'

  // Import Assets
  import { Closesvg } from "@/imports/svg";

  const SeatChart = ({ occasion, sportNFT, provider, setShowModal}
    : { 
      occasion: any; 
      sportNFT: Contract; 
      provider: BrowserProvider; 
      setShowModal: (showModal: boolean) => void 
    }
  ) => {
    const [seatsTaken, setSeatsTaken] = useState<Array<number>>([])
    const [hasSold, setHasSold] = useState<boolean>(false)

    const getSeatsTaken = async () => {
      console.log(Number(occasion.maxTickets));
      const seatBigTaken = await sportNFT.getTakenSeats(occasion.id)
      console.log("seats are: ")
      const seatsTaken: number[] = []
      for (const seat of seatBigTaken){
        seatsTaken.push(Number(seat))
      }
      setSeatsTaken(seatsTaken)
    }

    const buyHandler = async (_seat:number) => {
      setHasSold(false)
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const signer = await provider.getSigner(accounts[0]);
      const transaction = await sportNFT.connect(signer).mintNFT(occasion.id, _seat, { value: occasion.cost })
      await transaction.wait()

      setHasSold(true)
    }

    useEffect(() => {
      getSeatsTaken()
    }, [hasSold])

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 transition-opacity duration-300 ease-in-out">
        <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-2xl p-8 w-full max-w-lg mx-auto animate-scaleUp">
          <div className="occasion__seating">
            {/* Header with Title */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-white tracking-wide">
                {occasion.name} Seating Map
              </h1>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition duration-200"
              >
                <Closesvg className="transition-all duration-300 ease-in-out" />
              </button>
            </div>
    
            {/* Seating Grid */}
            <div className="grid grid-cols-10 gap-3">
              {seatsTaken &&
                Array(Number(occasion.maxTickets))
                  .fill(1)
                  .map((e, i) => (
                    <Seat
                      i={i}
                      step={1} // Start numbering from 1
                      columnStart={0} // Start from column 0
                      maxColumns={10} // Arrange seats in 10 columns
                      rowStart={1} // Start from row 1
                      maxRows={10} // Allow up to 10 rows
                      seatsTaken={seatsTaken} // Pass taken seats data
                      buyHandler={buyHandler} // Pass buy handler function
                      key={i} // Unique key for each seat
                    />
                  ))}
            </div>
          </div>
        </div>
      </div>
    );
    
  }

  export default SeatChart;