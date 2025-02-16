import { nftjson } from "./ticketlist";
import React,{useState} from "react";

export default function Ticket({ data }: { data: nftjson }) {

  return (
    <div
      className="relative max-w-48 rounded-2xl overflow-hidden bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600 group transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-3 group-hover:shadow-[0_8px_24px_0_rgba(255,255,255,0.6)] cursor-pointer outline-none"
    >
      {/* Ticket Image */}
      <img
        className="w-full h-48 object-cover transition-all duration-500"
        src={data.image}
        alt="ticket"
      />
      
      {/* Gradient Overlay for Details (Invisible until hover) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent opacity-0 group-hover:opacity-70 group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 transition-opacity duration-200 flex flex-col justify-end items-center px-4 py-6">
        <div className="text-center">
          <h3 className="font-extrabold text-xl text-white mb-2">{data.name}</h3>
          <p className="text-gray-300 text-sm italic mb-1">
            #{data.id}
          </p>
          <p className="text-gray-300 text-sm italic mb-1">
            {data.location}
          </p>
          <p className="text-gray-400 text-xs mb-4">
            {data.date}
          </p>
        </div>
        {/* Fancy Divider */}
      </div>
    </div>

    

  );
}
