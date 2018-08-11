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



var evtSource = new EventSource('http://localhost:9000/stream', {withCredentials: false});
var eventList = document.querySelector('ul');

evtSource.addEventListener('health', function(e) {
  console.log(e);

  var newElement = document.createElement("li");

  newElement.textContent = "health status: " + JSON.parse(e.data).status;
  eventList.appendChild(newElement);
});
