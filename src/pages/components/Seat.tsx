import {BigNumber} from "ethers" 
interface SeatProps {
    i: number;
    step: number;
    columnStart: number;
    maxColumns: number;
    rowStart: number;
    maxRows: number;
    seatsTaken: number[]; // Array of numbers representing taken seats
    buyHandler: (seatIndex: number) => void; // Function to handle seat selection
}

const Seat: React.FC<SeatProps> = ({ i, step, columnStart, maxColumns, rowStart, maxRows, seatsTaken, buyHandler }) => {
    // Calculate the seat number
    const seatNumber = i + step;
    // Check if the seat is taken
    const isSeatTaken = seatsTaken.includes(seatNumber);
    if (isSeatTaken == true){
        console.log("seat taken : ", seatNumber)
    }
        

    return (
        <div
            onClick={!isSeatTaken ? () => buyHandler(seatNumber) : undefined} // Only apply onClick if seat is not taken
            className={`${
                isSeatTaken ? "flex items-center justify-center cursor-pointer bg-slate-600" : "flex items-center justify-center cursor-pointer bg-green-600 hover:bg-emerald-900 text-white"
            } w-10 h-10 rounded-full p-2 text-center`}
            style={{
                gridColumn: `${((i % maxColumns) + 1) + columnStart}`,
                gridRow: `${Math.ceil(((i + 1) / maxRows)) + rowStart}`,
            }}
        >
            {seatNumber} 
        </div>
    );
};

export default Seat;
