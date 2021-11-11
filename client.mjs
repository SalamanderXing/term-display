import WebSocket from 'ws';

const ws = new WebSocket(`ws://${process.argv[2]}:8080`);

ws.on('open', function open() {
  console.log('connected');
  ws.send(Date.now());
});

ws.on('close', function close() {
  console.log('disconnected');
});

ws.on('message', function message(data) {
	//console.log(Object.keys(data))
	process.stdout.write(data)
});
