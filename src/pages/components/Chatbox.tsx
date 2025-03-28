import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client'
import { ethers } from 'ethers';

const Chatbox = ({ selectedTicket, closeChat }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState(''); // State for the current message input
  const [isVisible, setIsVisible] = useState(true); // State for visibility and animation
	const [userAddress, setUserAddress] = useState('');
	const [socket, setSocket] = useState(null);

	let lastSender = '';

  const sendMessage = async () => {
    if (message.trim()) {
			socket.emit('msg-send', {text:message, sender: userAddress});

      setMessage(''); // Clear the input field after sending
    }
  };

  const handleCloseChat = () => {
    setIsVisible(false); // Trigger close animation
    setTimeout(() => {
      closeChat(); // Close the chat after the animation ends
    }, 300); // Match the duration of the fade-out animation
  };

	const messagesEndRef = useRef(null);

	useEffect(() => {
  	// Scroll to the last message every time the messages array updates
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages]);


  useEffect(() => {
		console.log("selected event is", Math.floor(selectedTicket.id/1000));
		(async () => {
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();

			const user = (await signer.getAddress()).trim();
			setUserAddress(user);
		})()

		fetch('/api/socket').finally(() => {
    	const socket = io()
			setSocket(socket);

    	socket.on('connect', () => {
    	  console.log('Connected to chat');
    	  // socket.emit('hello')
    	})

			const grp = `chat-${Math.floor(selectedTicket.id/1000)}`

			socket.on('msg-recv', (msg) => {
    	 	setMessages((prevMessages) => {
					return [...prevMessages, { text: msg.text, sender: msg.sender }]
				});
			})

   		socket.on('disconnect', () => {
   	  	console.log('Disconnected from chat');
   		})

			socket.emit('join-room', grp);
			// socket.emit('msg-send', { text: "hello there!", sender: "me" });
    })
  }, []);

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
          {messages.map((message, index) =>{
						const displaySender = message.sender !== lastSender;
						if(displaySender){
							lastSender = message.sender;
						}
						return (
            <div key={index}>
						{displaySender && (
              <div className="font-bold text-sm mt-4 mb-2">{message.sender}</div>
            )}
						<div
              className={`p-4 rounded-xl max-w-md ${
                message.sender === userAddress
                  ? 'bg-[#cea9f6] text-black self-end'
                  : 'bg-[#6c607e] text-white self-start'
              }`}
							ref={messagesEndRef}
            >
              <span>{message.text}</span>
            </div>
						</div>
          );
					})}
        </div>

        {/* Input field and Send button */}
        <div className="flex flex-col space-y-2 mx-4 mt-4">
          {/* Warning Sign above input */}
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)} // Update message state
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
