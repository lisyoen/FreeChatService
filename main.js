var socket = io.connect('http://lisyoen.cafe24.com:8003');

function send() {
  socket.emit('client chat', {message:message.value});
	message.value = "";
}

$(function() {
	function echoMessage(msg) {
		chatContents.innerHTML = chatContents.innerHTML + '<br />' + msg;
		$('#commonRoom').animate({scrollTop:$('#chatContents').height()}); 
	}

	socket.on('server chat', function(data) {
		console.log(data);
		//message_list.innerHTML = "Other :" + data.message + "<br />" + message_list.innerHTML;
		echoMessage("Other :" + data.message);

	});

	socket.on('server echo chat', function(data) {
		echoMessage("Me :" + data.message);
	});

	socket.on('system report', function(data) {
		if (data.err) {
			echoMessage('Error :' + data.stderr);
		} else {
			echoMessage('System :' + data.stdout);
		}
	});

	$('#message').select().focus().trigger('change');
});
