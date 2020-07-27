const socket = io('http://localhost:3003');

// Get dom elements in respective Js veriable
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');

// Audio will play on receive message
var audio = new Audio('http://localhost/nodejs_demos/assets/mp3/ting.mp3');

// function which will append to the container
const append = (message, position) =>{
	const messageElement = document.createElement('div');
	messageElement.innerText = message;
	messageElement.classList.add('message');
	messageElement.classList.add(position);
	messageContainer.append(messageElement);
	if (position == 'left') {
		audio.play();
	}
	screollBottom();
}

if(form != null) {
	// Join chatroom
	socket.emit('joinRoom', {user_id : user_id,room: room_id});
	// If the form get submitted send server to the message
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const message = messageInput.value;
		append(`You : ${message}`, 'right');
		
		// socket.emit is for call a server method
		socket.emit('sendMessage', {message : message,room : room_id});
		messageInput.value = '';
	});
}


// IF user is type some thing then other user must know
socket.on('message', name => {
	// append(`${name} joined the chat`, 'right');
});

// IF server receive it
socket.on('receiveMessage', data => {
	append(`${data.name} : ${data.message}`, 'left');
});

// IF the user left the chat appent the info to the container 
socket.on('left', name => {
	append(`${name} left the chat`, 'left');
});

function screollBottom() {
	messageContainer.scrollTop = messageContainer.scrollHeight;
}
