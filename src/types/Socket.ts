import WebSocket from 'ws';

interface Socket {
	name: string;
	link: string;
	ip: string;
	server: string;
	socket: WebSocket;
}

export default Socket;