'use strict'
var express = require('express'),
	bodyParser = require('body-parser'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	mongo = require('mongodb'),
	jwt = require('jwt-simple'),
	NodeRSA = require('node-rsa'),
	fs = require('fs'),
	bcrypt = require('bcrypt-nodejs'),
	key = new NodeRSA();
var users = [],messages=[];
var mongoURL = "mongodb://ElZombieIsra:awadeewe@awadeewe-shard-00-00-xdx9j.mongodb.net:27017,awadeewe-shard-00-01-xdx9j.mongodb.net:27017,awadeewe-shard-00-02-xdx9j.mongodb.net:27017/test?ssl=true&replicaSet=awadeewe-shard-0&authSource=admin";
var token = '';
var secret = 'awadeewe';
/*
mongo.connect(mongoURL,(err, db)=>{
	if (err) throw err;
	db.collection('users').insertOne({user:'',pass:bcrypt.hashSync('')} ,(err,result)=>{
		if (err) throw err;
		console.log('Usuario creado con éxito');
		db.close();
	});
});
/*
mongo.connect(mongoURL,(err,db)=>{
	if (err) throw err;
	db.collection('msg').drop((err, delOk)=>{
		if (err) throw err;
		if (delOk) console.log('Collection deleted');
		db.close();
	});
});
/**/
key.importKey('-----BEGIN PUBLIC KEY-----'
+'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAI7vPgJWG8AJSI/FtM7j7w/895Sh+4c6'
+'EG8cwv6FgjUdVKku2YtMxEdxeC+Sf78c9Pm+KJrJbnIbWeRX11hQod0CAwEAAQ=='
+'-----END PUBLIC KEY-----','pkcs8-public-pem');
key.importKey('-----BEGIN PRIVATE KEY-----'
+'MIIBVgIBADANBgkqhkiG9w0BAQEFAASCAUAwggE8AgEAAkEAju8+AlYbwAlIj8W0'
+'zuPvD/z3lKH7hzoQbxzC/oWCNR1UqS7Zi0zER3F4L5J/vxz0+b4omsluchtZ5FfX'
+'WFCh3QIDAQABAkEAiCkSGimrL8noLMW7EyeBUeq6cwXH1a8TfrWYb9wBCNSdYGmK'
+'6bxap6jeT7iYuULLA8DUCdyZDJNdmqtMp+mFQQIhAO+GJMAQCVp/+cR0Hn4g2aRz'
+'SyBrBtEBLhul+Or8cgORAiEAmMQ5Kf9NpYHkTPEhIgJEwb4bP64l7RB/Pd3COGXu'
+'e40CIQDkGz8yfdM6kbf+xIspmQVMXNRGGkcSkmojwItu1l2KUQIhAIH58ekZnybC'
+'bUxJnLci1v1Akk6MDRi2gIxSsXzqvQ3BAiBxlT5l4Q3RS9Q9leZFo+SyLq7Aqk3y'
+'YZUcLLOxx2QtWg=='
+'-----END PRIVATE KEY-----','pkcs8-private-pem');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.set('view engine','pug');
app.set('port', (process.env.PORT || 5000));
io.on('connection',(socket)=>{
	mongo.connect(mongoURL,(err,db)=>{
		if (err) throw err;
		db.collection('msg').find({},{_id:false}).toArray((err,result)=>{
			console.log(result);
			if (err) throw err;
			try{
				var rr = [];
				for (var i = 0; i < result.length; i++) {
					rr[i]=JSON.parse(key.decrypt(result[i].enc,'utf8'));
				}
				var decrypted = (result.enc, 'utf8');
				socket.emit('oldMsg',rr);
			} catch(err){ console.log(err);}
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
		let user = String(data.user).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
		let str = String(msg).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
		msgJson.user = user;
		msgJson.msg=str;
		let JString = JSON.stringify(msgJson);
		var encrypted = key.encrypt(JString, 'base64');
		mongo.connect(mongoURL,(err,db)=>{
			if (err) throw err;
			console.log('DB conectada crear msg');
			db.collection('msg').insertOne({enc:encrypted},(err,result)=>{
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
		db.collection('users').findOne({user:fUser},(err,result)=>{
			if (err){
				console.log('Error: '+err);
			}else{
				if (result!==null&&bcrypt.compareSync(fPass,result.pass)) {
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
		res.render('chat',payload);
	}catch(err){
		console.log('Error: '+err);
		res.redirect('/');
	}
});

http.listen(app.get('port'),()=>{
	console.log('Server listening in port '+app.get('port'));
});
