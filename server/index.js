const express = require('express')
const Stream = require('./sse');

const app = express();

app.get('/', (req, res) => res.send('Hello World!'));

const stream = new Stream();
app.use(stream.enable());

app.get('/stream', function(request, response) {
  stream.add(request, response);
  stream.push_sse(1, "opened", { msg: 'connection opened!' });
});
app.get('/test_route', function(request, response){
  stream.push_sse(2, "new_event", { event: true });
  return response.json({ msg: 'admit one' });
});

let val = 0;

setInterval(() => {
  const newVal = val === 'UP' ? 'DOWN' : 'UP';
  val = newVal;
  stream.push_sse(1, 'HEALTH_CHECK', { INGESTION_HEARTBEAT: newVal });
}, 5000);


app.listen(9000, () => console.log('Example app listening on port 9000!'))

