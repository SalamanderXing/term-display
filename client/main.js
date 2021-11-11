const wsFactory = {
	tryCount: 3,
	connect: async function (url) {
		var ctx = this,
			ws = new WebSocket(url);

		return await new Promise(function (v, x) {
			ws.onerror = (e) => {
				console.log(
					`WS connection attempt ${4 - ctx.tryCount} -> Unsuccessful`
				);
				e.target.readyState === 3 && --ctx.tryCount;
				if (ctx.tryCount > 0) setTimeout(() => v(ctx.connect(url)), 1000);
				else x(new Error("3 unsuccessfull connection attempts"));
			};
			ws.onopen = (e) => {
				console.log(`WS connection Status: ${e.target.readyState}`);
				v(ws);
			};
			ws.onmessage = (m) => {
				const data = m.data
				if (typeof data != 'string'){
					data.text().then(console.log)
				}
				else{
					console.log(data)
				}
			};
		});
	},
};

const ws = await wsFactory.connect("ws://localhost:8080")
ws.send("Hey..! This is my first socket message")
