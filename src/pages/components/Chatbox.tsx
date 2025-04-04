import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client'
import { ethers } from 'ethers';

const Chatbox = ({ selectedTicket, closeChat }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [userAddress, setUserAddress] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const processedMessagesRef = useRef(new Set());

  // Function to trim wallet addresses for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const sendMessage = async () => {
    if (message.trim() && socketRef.current) {
      socketRef.current.emit('msg-send', {text: message, sender: userAddress});
      setMessage('');
    }
  };

  const handleCloseChat = () => {
    setIsVisible(false);
    setTimeout(() => {
      closeChat();
    }, 300);
  };

  // Scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize everything - socket, user address, etc.
  useEffect(() => {
    console.log("selected event is", Math.floor(selectedTicket.id / 1000));
  
    // Get user address
    const getUserAddress = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const user = (await signer.getAddress()).trim();
        setUserAddress(user);
      } catch (error) {
        console.error("Error getting user address:", error);
      }
    };
  
    getUserAddress();
  
    // Load messages from sessionStorage on every render
    const savedMessages = sessionStorage.getItem('msgs');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).messages;
        setMessages(parsedMessages);
  
        // Ensure processedMessagesRef is updated too
        parsedMessages.forEach(msg => {
          processedMessagesRef.current.add(`${msg.sender}:${msg.text}`);
        });
      } catch (e) {
        console.error("Error loading messages from session storage:", e);
        sessionStorage.removeItem('msgs');
      }
    }
  
    // Setup socket connection
    fetch('/api/socket').finally(() => {
      if (!socketRef.current) {
        const socket = io();
        socketRef.current = socket;
  
        socket.on('connect', () => {
          console.log('Connected to chat');
        });
  
        const grp = `chat-${Math.floor(selectedTicket.id / 1000)}`;
  
        socket.on('msg-recv', (msg) => {
          const messageKey = `${msg.sender}:${msg.text}`;
  
          if (!processedMessagesRef.current.has(messageKey)) {
            processedMessagesRef.current.add(messageKey);
  
            setMessages((prevMessages) => {
              const newMessages = [...prevMessages, { text: msg.text, sender: msg.sender }];
              return newMessages;
            });
          }
        });
  
        socket.on('disconnect', () => {
          console.log('Disconnected from chat');
        });
  
        socket.emit('join-room', grp);
      }
    });
  
		return () => {
			// Disconnects socket on unmount
			if (socketRef.current) {
				socketRef.current.disconnect()
				socketRef.current = null
			}

			// Save messages to sessionStorage on unmount
			if(typeof messages !== 'undefined' && messages.length > 0) {
				sessionStorage.setItem('msgs', JSON.stringify({ messages: messages }));
			}
		}
  }, [selectedTicket.id]);
  
  return (
    <div
      className={`fixed inset-0 bg-[#0a0813] bg-opacity-90 flex items-center justify-center z-50 transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}
    >
      <div className="bg-[#0a0813] rounded-3xl w-full max-w-4xl shadow-2xl transform transition-all duration-300 scale-105">
        {/* Header Section */}
        <div className="flex justify-between items-center border-b-2 border-gray-600 bg-[#202133] px-6 py-4 rounded-t-3xl">
          <h2 className="text-2xl font-semibold text-[#cea9f6]">
            Chat with {selectedTicket.name}
          </h2>
          <button
            onClick={handleCloseChat}
            className="text-3xl font-bold text-gray-300 hover:text-[#cea9f6] focus:outline-none"
          >
            &times;
          </button>
        </div>

        {/* Chat messages section */}
        <div className="overflow-y-auto max-h-96 mb-6 space-y-4 bg-[#0a0813] p-4 rounded-b-3xl">
          {(() => {
            let lastSender = '';
            
            return messages.map((msg, index) => {
              const isLastMessage = index === messages.length - 1;
              const displaySender = msg.sender !== lastSender;
              
              if (displaySender) {
                lastSender = msg.sender;
              }
              
              return (
                <div key={index} className={`flex flex-col ${msg.sender === userAddress ? 'items-end' : 'items-start'}`}>
                  {displaySender && (
                    <div className={`font-bold text-sm mt-4 mb-2 ${msg.sender === userAddress ? 'text-right' : ''}`}>
                      {formatAddress(msg.sender)}
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-xl max-w-md ${
                      msg.sender === userAddress
                        ? 'bg-[#cea9f6] text-black'
                        : 'bg-[#6c607e] text-white'
                    }`}
                    ref={isLastMessage ? messagesEndRef : null}
                  >
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {/* Input field and Send button */}
        <div className="flex flex-col space-y-2 mx-4 mt-4">
          {/* Warning Sign above input */}
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full border-2 border-gray-600 rounded-full p-4 bg-[#373658] text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#cea9f6] transition-all duration-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
            />
            <button
              onClick={sendMessage}
              className="bg-[#6c607e] text-white px-6 py-3 rounded-full shadow-lg hover:bg-[#cea9f6] transition-all duration-300"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
