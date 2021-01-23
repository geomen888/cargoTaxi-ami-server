const Boom          = require("@hapi/boom")
const HAPI          = require("@hapi/hapi")
const HAPIAuthBasic = require("@hapi/basic")
const HAPIWebSocket = require("hapi-plugin-websocket")
const WSS           = require("ws");
const jwt           = require('jsonwebtoken');

(async () => {
    /*  create new HAPI service  */
    const server = new HAPI.Server({ address: "127.0.0.1", port: 3000 })

    /*  register HAPI plugins  */
    await server.register(HAPIWebSocket)
    await server.register(HAPIAuthBasic)

    /*  register Basic authentication stategy  */
    server.auth.strategy("basic", "basic", {
        allowEmptyUsername: true,
        validate: async (request, _, token, h) => {
            // console.log("token:", token);
            let isValid     = false
            let credentials = null

            if (token) {
                const decoded = await jwt.verify(token, "your-256-bit-secret");
                if (decoded.sub === "user1") {
                    isValid = true;
                    credentials = { ...decoded }
                }
                
            }
            return { isValid, credentials }
        }
    });

    /*  provide plain REST route  */
    server.route({
      method: "POST", path: "/foo",
      config: {
          payload: { output: "data", parse: true, allow: "application/json" }
      },
      handler: (request, h) => {
          return { at: "foo", seen: request.payload }
      }
  })

    server.route({
        method: "POST", path: "/quux",
        config: {
            response: { emptyStatusCode: 204 },
            payload: { output: "data", parse: true, allow: "application/json" },
            auth: { mode: "required", strategy: "basic" },
            plugins: {
                websocket: {
                    only: true,
                    initially: true,
                    subprotocol: "quux/1.0",
                    connect: ({ ctx, ws } ) => {
                        ctx.to = setInterval(() => {
                            if (ws.readyState === WSS.OPEN)
                                ws.send(JSON.stringify({ cmd: "PING" }))
                        }, 5000)
                    },
                    disconnect: ({ ctx }) => {
                        if (ctx.to !== null) {
                            clearTimeout(this.ctx)
                            ctx.to = null
                        }
                    }
                }
            }
        },
        handler: (request, h) => {
            let { initially, ws } = request.websocket()
            if (initially) {
                ws.send(JSON.stringify({ cmd: "HELLO", arg: request.auth.credentials.username }))
                return ""
            }
            if (typeof request.payload !== "object" || request.payload === null)
                return Boom.badRequest("invalid request")
            if (typeof request.payload.cmd !== "string")
                return Boom.badRequest("invalid request")
            if (request.payload.cmd === "PING")
                return { result: "PONG" }
            else if (request.payload.cmd === "AWAKE-ALL") {
                var peers = request.websocket().peers
                peers.forEach((peer) => {
                    peer.send(JSON.stringify({ cmd: "AWAKE" }))
                })
                return ""
            }
            else
                return Boom.badRequest("unknown command")
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);

})()
.catch((err) => {
    console.log(`ERROR: ${err}`)
})

// const express = require('express')
// const Stream = require('./sse');

// const app = express();

// app.get('/', (req, res) => res.send('Hello World!'));

// const stream = new Stream();
// app.use(stream.enable());

// app.get('/stream', function(request, response) {
//   stream.add(request, response);
//   stream.push_sse(1, "opened", { msg: 'connection opened!' });
// });
// app.get('/test_route', function(request, response){
//   stream.push_sse(2, "new_event", { event: true });
//   return response.json({ msg: 'admit one' });
// });

// let val = 0;

// setInterval(() => {
//   const newVal = val === 'UP' ? 'DOWN' : 'UP';
//   val = newVal;
//   stream.push_sse(1, 'HEALTH_CHECK', { INGESTION_HEARTBEAT: newVal });
// }, 5000);


// app.listen(3000, () => console.log('Example app listening on port 3000!'))

