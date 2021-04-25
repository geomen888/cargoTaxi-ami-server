console.log('working');

// var myHeaders = new Headers();
// myHeaders.append('Content-Type', 'image/jpeg');

// var myInit = { method: 'GET',
//                headers: myHeaders,
//                mode: 'cors',
//                cache: 'default' };

// var myRequest = new Request('flowers.jpg');

// fetch(myRequest,myInit).then(function(response) {
//   console.log(response);
// });
const WSS = require("ws");
const jwt = require("jsonwebtoken");
let wss1 = null;
let wss2 = null;

const connectLambda = () => {
  wss1 = new WSS('wss://1672wkkz50.execute-api.eu-central-1.amazonaws.com/dev', 'ami-1.0', {
    headers: {
      "X-Amz-Security-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMSIsImRhdGEiOiJTZW1lbiIsImlhdCI6MTUxNjIzOTAyMiwiSUQiOiIyNjQ4ZjY3My03MDA4LTQyMWEtYTg5NC04NWJlYjVlYTg4MzMifQ.XE3fFttmpNUbenTcGl4bj66-PLRRlgS7OnNR46CRKmc",
    }
  });
};
connectLambda();

const connectAster = () => {
  wss2 = new WSS('ws://socks.jit.com.ua/dev', 'ami-1.0', 
  // {
    // headers: {
    //   "X-Amz-Security-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMSIsImRhdGEiOiJTZW1lbiIsImlhdCI6MTUxNjIzOTAyMiwiSUQiOiIyNjQ4ZjY3My03MDA4LTQyMWEtYTg5NC04NWJlYjVlYTg4MzMifQ.XE3fFttmpNUbenTcGl4bj66-PLRRlgS7OnNR46CRKmc",
   //   }
  // }
  );
};
connectAster();


wss1.on('open', function open() {
  console.log('connected-lambda');
  const msg = JSON.stringify({ action: 'message', message: "Hello" }) // clientId: '110ec58a-a0f2-4ac4-8393-c866d813b8d1'   
  wss1.send(msg);
});

wss1.on('onclose', function onclose(e) {
  console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
  setTimeout(function () {
    connectLambda();
  }, 1000);
});

wss1.on('onerror', function (err) {
  console.error('Socket encountered error: ', err.message, 'Closing socket');
  wss1.close();
});


wss2.on('open', function open() {
  console.log('connected-asterisk');
  const msg = JSON.stringify({ action: 'message', message: "Hello" }) // clientId: '110ec58a-a0f2-4ac4-8393-c866d813b8d1'   
  // wss2.send(msg);
});

wss2.on('onclose', function onclose(e) {
  console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
  setTimeout(function () {
    connectLambda();
  }, 1000);
});

wss2.on('onerror', function (err) {
  console.error('Socket encountered error: ', err.message, 'Closing socket');
  wss2.close();
});


// var evtSource = new EventSource('http://localhost:9000/stream', { withCredentials: false });
// var eventList = document.querySelector('ul');

// evtSource.addEventListener('health', function (e) {
//   console.log(e);

//   var newElement = document.createElement("li");

//   newElement.textContent = "health status: " + JSON.parse(e.data).status;
//   eventList.appendChild(newElement);
// });
