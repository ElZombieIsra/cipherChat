'use strict'
var socket = io();
$(document).ready(()=>{
	$('form').submit(()=>{
		let msg = $('#msg');
		socket.emit('newMsg',msg.val());
		msg.val('');
		return false;
	});

	socket.on('Msg',(m)=>{
		$('#msgs').html($('#msgs').html()+m+' <br>');
	});
	socket.on('oldMsg',(oldMsgs)=>{
		if (oldMsgs.length!==0) {
			let oM = '';
			for (var i = 0; i < oldMsgs.length; i++) {
				oM += oldMsgs[i]+' <br>';
			}
			$('#msgs').html(oM);
		}
	});
});