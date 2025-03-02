import React, { useState } from "react";
import { X } from "lucide-react";

const AddReward = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !cost || !code) {
      alert("All fields are required");
      return;
    }
    onSubmit({ name, cost, code });
    setName("");
    setCost("");
    setCode("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96 relative">
        <button
          className="absolute top-2 right-2 text-white hover:text-gray-400"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-white mb-4">Create Reward</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-white block mb-1">Reward Name</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="text-white block mb-1">Cost</label>
            <input
              type="number"
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="text-white block mb-1">Gift Card Code</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded font-medium"
          >
            Add Reward
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddReward;
