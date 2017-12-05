'use strict'
var socket = io();
$(document).ready(()=>{
	$('form').submit(()=>{
		let msg = $('#msg');
		let formData = {
			'user': $('#user').val(),
			'msg': msg.val(),
		};
		socket.emit('newMsg',formData);
		msg.val('');
		return false;
	});

	socket.on('Msg',(m)=>{
		let htm = '<div class="row">'
		+'<div class="col-2 font-weight-bold">'+m.user+':</div>'
		+'<div class="col text-justify">'+m.msg+'</div>'
		+'</div>';
		$('#msgs').html($('#msgs').html()+htm);
	});
	socket.on('oldMsg',(oldMsgs)=>{
		if (oldMsgs.length!==0) {
			let oM = '';
			let htm = '';
			for (var i = 0; i < oldMsgs.length; i++) {
				let m = oldMsgs[i];
				htm += '<div class="row">'
				+'<div class="col-2 font-weight-bold">'+m.user+':</div>'
				+'<div class="col text-justify">'+m.msg+'</div>'
				+'</div>';
			}
			$('#msgs').html(htm);
		}
	});
});