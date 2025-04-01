import { Server } from 'socket.io'

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
			console.log('A user connected');

			socket.on('join-room', grp => {
				console.log("Joining group:", grp);
				socket.join(grp);
				console.log("Available rooms:", io.sockets.adapter.rooms);
			});

			socket.on('msg-send', msg => {
				// console.log('Sending msg: ', msg.text);
				io.to(Array.from(socket.rooms)[1]).emit('msg-recv', msg);
			});

			socket.on('app-request', address => {
				const grp = `${address}-user`
				console.log("app-request received at socket");
				console.log(`Checking for user socket: ${grp}`);
				// console.log("Available rooms:", Object.keys(io.sockets.adapter.rooms));
				if(io.sockets.adapter.rooms.has(grp)) {
					io.to(grp).emit('app-request', address);
				} else {
					console.log("User socket not found");
					socket.emit('request-failed', address);
				}
			});

			socket.on('request-success', address => {
				const grp = `${address}-verifyapi`
				console.log("Available rooms:", Object.keys(io.sockets.adapter.rooms));
				if(io.sockets.adapter.rooms.has(grp)) {
					io.to(grp).emit('request-success', address);
				} else {
					console.log("VerifyAPI socket not found");
				}
			});

			socket.on('request-failed', address => {
				const grp = `${address}-verifyapi`
				if(io.sockets.adapter.rooms.has(grp)) {
					io.to(grp).emit('request-failed', address);
				} else {
					console.log("VerifyAPI socket not found");
				}
			});

			socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    })
  }
  res.end()
}

export default SocketHandler
