import io from 'socket.io-client'

const VerifyRequest = (req, res) => {
	if (req.method === 'GET') {
		fetch('http://localhost:3000/api/socket').finally(() => {
			const socket = io('http://localhost:3000');
			const { address } = req.query;

			setTimeout(() => res.status(400).json({ error: "Timed out" }), 20000);

			if (!address) {
				return res.status(400).json({ error: 'Address parameter is required' });
			} console.log("VerifyReq address:", address);

			socket.on('connect', () => {
				console.log('VerifyRequest socket connected');
			});

			socket.on('connect_error', (err) => {
				console.log('VerifyRequest socket Connection Error');
			});

			socket.on('disconnect', () => {
				console.log('VerifyRequest socket disconnected');
			});

			console.log("Joining room and requesting");
			socket.emit('join-room', `${address.toLowerCase()}-verifyapi`)
			socket.emit('app-request', address.toLowerCase());

			socket.on('request-success', (address) => {
				res.status(200).json({ message: `Fetch NFC request for ${address} succeeded` });
				res.end()
			});

			socket.on('request-failed', (address) => {
				res.status(401).json({ error : `Fetch NFC request for ${address} failed` });
				res.end()
			});
		});
	} else {
		res.status(405).json({ error: 'Method Not Allowed' });
	}
}

export default VerifyRequest
