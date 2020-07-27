var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
const cors = require('cors');
app = express();
require('dotenv').config();
var con = require('./config/database');
var array_methods = require('./utils/array_methods');
var convert_methods = require('./utils/convert_methods');

/* Token Check */
var common = require('./config/common');
/* Language File Load */
const localizify = require('localizify');
const en = require('./languages/en.json');

/* Load routes */
var UserRoute = require('./modules/v1/user/route');
var viewdocs = require('./modules/v1/api_docs/route');

app.use(cors());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

/* set localization */
localizify.add('en', en); 
app.use((request, response, next) => {
    const lang = localizify.detectLocale(request.headers['accept-language']) || "en";
    localizify.setLocale(lang);
    next();    
});

// use the route.js to handle endpoint request which start with these endpoints
app.use('/api/v1/viewdocs/',viewdocs);
app.use(common.validate_token);
app.use('/api/v1/user/',UserRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404).send({
        status: 404,
        message: 'the url you are trying to reach is not hosted on our server'
    })
});

// error handler middleware
app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
        error: {
            status: error.status || 500,
            message: error,
        },
    });
});

const { PORT } = process.env;

// Create server for the socket io
const server = require('http').createServer(app);
const io = require('socket.io')(server);

server.listen(process.env.PORT || PORT, function() {
    console.log("server connected to port " + PORT);
});


// users which are currently connected to the chat
var users = {};

io.on('connection', socket => {
	var currentRoomId;
	// new user joined 
	socket.on('joinRoom', (params) => {
		console.log(socket.handshake.headers.referer);
		if(params.room != '' && params.user_id != '' ) {
			con.query("SELECT name FROM tbl_user WHERE id='"+params.user_id+"'", function(err, user_result){
				// send client to selected room
				socket.join(params.room);
				currentRoomId = params.room;
				// add the client's username to the global list
				users[socket.id] = params.user_id;
				// Broadcast when a user connects
				socket.broadcast.to(params.room).emit('message', user_result[0].name);
			})
		}
	});

	// when the client emits 'new message', this listens and executes
	socket.on('sendMessage',(params) => {
		console.log(socket.handshake.headers.referer);
		con.query("SELECT name FROM tbl_user WHERE id= '"+users[socket.id]+"'", function(err,result){
			const chat_params = {
				room_id : params.room,
				user_id : users[socket.id],
				message : params.message,
			}
			// insert data into the tbl chat 
			con.query("INSERT INTO tbl_chat SET ? ",chat_params, function(err,insertresult) {
				// we tell the client to execute 'new message'
				socket.to(params.room).emit('receiveMessage', {name : result[0].name, message:params.message});
			});
		})
	});

	// when the client emits 'new message', this listens and executes
	socket.on('disconnect',(data) => {
		if(currentRoomId != undefined) {
			// we tell the client to execute 'disconnect'
			con.query("SELECT name FROM tbl_user WHERE id= '"+users[socket.id]+"'", function(err,result){
				// we tell the client to execute 'new message'
				socket.broadcast.in(currentRoomId).emit('left', result[0].name);
			})	
		}
	});
});