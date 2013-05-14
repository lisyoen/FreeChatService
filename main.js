var socket = io.connect('http://lisyoen.cafe24.com:8003');

var user = {
	nickname: 'User' + parseInt(Math.random() * 10000)
};

function send(msg) {
	if (msg.trim().length === 0) return;
	socket.emit('client chat', {nickname: user.nickname, message: msg});
}

function changeNickname(nickname) {
	if (nickname.trim().length > 0) {
		user.nickname = nickname;
		setNickname(nickname);
	}
	view.closeLoginPopup();
	view.setFocusToInput();
}

function getNickname() {
	return $.cookie('nickname');
}

function setNickname(nickname) {
	return $.cookie('nickname', nickname);
}

$(function() {
	var nickname = getNickname();
	if (nickname) {
		user.nickname = nickname;
	} else {
		setNickname(user.nickname);
	}
	
	view.setUsername(user.nickname);

	socket.on('connect', function () {
		console.log('connect');
		console.log(socket);
		socket.emit('client join', {nickname: user.nickname});
	});

	socket.on('server chat', function(data) {
		console.log(data);
		view.echoMessage({nickname: data.nickname, message: data.message});
	});

	socket.on('server echo chat', function(data) {
		console.log(data);
		view.echoMessage({nickname: data.nickname, message: data.message});
	});

	socket.on('system report', function(data) {
		if (data.err) {
			view.echoSystemMessage('Error :' + data.stderr);
		} else {
			view.echoSystemMessage('System :' + data.stdout);
		}
	});
	
	socket.on('system chat', function(data) {
		view.echoSystemMessage(data.message);
	});

	view.setFocusToInput();
});
