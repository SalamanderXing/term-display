const WebSocketServer = require("ws").WebSocketServer;

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws) {
	ws.on("message", function message(data) {
		console.log("received: %s", data);
	});

	ws.send("something");
	const dummy = {
		write:(msg)=>{
			
			ws.send(msg)
		},
		on:(...a)=>{ws.on(...a)},
		once:(...a)=>{ws.once(...a)},
		emit:(...a)=>{ws.emit(...a)},
		end:()=>{
			ws.close()
		},
		removeListener: (...a)=>{
			ws.removeListener(...a)
		}
	}
	sshPipe(dummy)
});

const sshPipe = async (socket) => {
	const { NodeSSH } = require("node-ssh");

	const ssh = new NodeSSH();
	await ssh.connect({
		host: "localhost",
		username: "bluesk",
		password: "@Bobina1",
		agent: process.env.SSH_AUTH_SOCK,
		compress: true,
	});

	const pipeStream = (stream) => {
		const { stdin, stdout, stderr } = process;
		const { isTTY } = stdout;

		if (isTTY && stdin.setRawMode) stdin.setRawMode(true);

		stream.pipe(stdout);
		stream.pipe(socket);
		stream.stderr.pipe(stderr);
		stdin.pipe(stream);

		const onResize =
			isTTY &&
			(() => stream.setWindow(stdout.rows, stdout.columns, null, null));
		if (isTTY) {
			stream.once("data", onResize);
			process.stdout.on("resize", onResize);
		}
		stream.on("close", () => {
			if (isTTY) process.stdout.removeListener("resize", onResize);
			stream.unpipe();
			stream.stderr.unpipe();
			stdin.unpipe();
			if (stdin.setRawMode) stdin.setRawMode(false);
			stdin.unref();
		});
	};

	await new Promise((resolve, reject) => {
		ssh.connection.shell(
			{ term: process.env.TERM || "vt100" },
			(err, stream) => {
				if (err) {
					reject(err);
					return;
				}
				pipeStream(stream);
				stream.on("close", () => resolve(true));
			}
		);
	});

	ssh.dispose();
};
