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
				// console.log("Joining group: ", grp);
				socket.join(grp);
			});

			socket.on('msg-send', msg => {
				// console.log('Sending msg: ', msg.text);
				io.to(Array.from(socket.rooms)[1]).emit('msg-recv', msg);
			});

			socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    })
  }
  res.end()
}

export default SocketHandler
