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
		let htm = '<div class="row msg_container base_receive"><div class="col-md-10 col-xs-10"><div class="messages msg_sent"><div class="font-weight-bold">'+m.user+':</div><div class="text-justify">'+m.msg+'</div></div></div></div>';
		$('#msgs').html($('#msgs').html()+htm);
		$(".msg_container_base").stop().animate({ scrollTop: $(".msg_container_base")[0].scrollHeight}, 1000);
	});
	socket.on('oldMsg',(oldMsgs)=>{
		if (oldMsgs.length!==0) {
			let oM = '';
			let htm = '';
			for (var i = 0; i < oldMsgs.length; i++) {
				let m = oldMsgs[i];
				htm += '<div class="row msg_container base_receive"><div class="col-md-10 col-xs-10"><div class="messages msg_sent"><div class="font-weight-bold">'+m.user+':</div><div class="text-justify">'+m.msg+'</div></div></div></div>';
			}
			setTimeout(()=>{
				$(".msg_container_base").stop().animate({ scrollTop: $(".msg_container_base")[0].scrollHeight}, 1000);
			},500);
			
			$('#msgs').html(htm);
		}
	});
	$('#exit').click(()=>{
		localStorage.removeItem('token');
		window.location.href='/';
	});
});