'use strict'
var express = require('express'),
	bodyParser = require('body-parser'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	mongo = require('mongodb'),
	jwt = require('jwt-simple'),
	NodeRSA = require('node-rsa'),
	key = new NodeRSA({b:128});
var users = [],messages=[];
var mongoURL = "mongodb://ElZombieIsra:awadeewe@awadeewe-shard-00-00-xdx9j.mongodb.net:27017,awadeewe-shard-00-01-xdx9j.mongodb.net:27017,awadeewe-shard-00-02-xdx9j.mongodb.net:27017/test?ssl=true&replicaSet=awadeewe-shard-0&authSource=admin";
var token = '';
var secret = 'awadeewe';
var publicPEM = key.exportKey('pkcs8-public-pem'),
	privatePEM = key.exportKey('pkcs8-private-pem');
	console.log(publicPEM);
	console.log(privatePEM);
/*
mongo.connect(mongoURL,(err, db)=>{
	if (err) throw err;
	db.collection('users').insertOne({user:'test',pass:'test'},(err,result)=>{
		if (err) throw err;
		console.log('Usuario creado con éxito');
	});
});
/**/
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.set('view engine','pug');
app.set('port', (process.env.PORT || 5000));
io.on('connection',(socket)=>{
	mongo.connect(mongoURL,(err,db)=>{
		if (err) throw err;
		console.log('Conexión exitosa, leer Mensajes');
		db.collection('msg').find({},{_id:false}).toArray((err,result)=>{
			if (err) throw err;
			socket.emit('oldMsg',result);
			db.close();
		});
	});
	console.log(messages);
	users.push(socket.id);
	console.log('An user is online');
	socket.broadcast.emit('userOnline');
	socket.on('disconnect', ()=>{
		console.log('An user is offline');
		socket.broadcast.emit('userOffline');
	});
	socket.on('newMsg',(data)=>{
		let msgJson = {
			user:'',
			msg:''
		};
		let msg = data.msg;
		let user = String(data.user).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		let str = String(msg).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		msgJson.user = user;
		msgJson.msg=str;
		mongo.connect(mongoURL,(err,db)=>{
			if (err) throw err;
			console.log('DB conectada crear msg');
			db.collection('msg').insertOne(msgJson,(err,result)=>{
				if (err) throw err;
				console.log('Mensaje añadido con éxito');
				db.close();
			});
		});
		messages.push(msgJson);
		io.sockets.emit('Msg',msgJson);
	});
	socket.on('sub',(f)=>{
		console.log(f);
	});
});

app.post('/iniciaSesion',(req,res)=>{
	let fUser = req.body.user;
	let fPass = req.body.pass;
	console.log('User: '+fUser+', pass: '+fPass);
	mongo.connect(mongoURL,(err,db)=>{
		if (err) throw err;
		console.log('DB Connected');
		db.collection('users').findOne({user:fUser,pass:fPass},(err,result)=>{
			if (err){
				console.log('Error: '+err);
			}else{
				if (result!==null) {
					token = jwt.encode(result,secret);
					res.send({token:token});
				}else{
					res.send('No existe');
				}
			}
			db.close();
		});
	});
});

app.post('/chat',(req,res)=>{
	let token = req.body.token;
	var payload;
	try{
		payload = jwt.decode(token,secret);
	}catch(err){
		console.log('Error: '+err);
	}
	console.log(payload);
	res.render('chat',payload);
});

http.listen(app.get('port'),()=>{
	console.log('Server listening in port '+app.get('port'));
});
