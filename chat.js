// reference to http://socket.io/#how-to-use

var app = require('http').createServer(handler)
	, io = require('socket.io').listen(app)
	, fs = require('fs')
	, exec = require('child_process').exec
	, monitor = require('./service-monitor');

app.listen(8003);

function handler (req, res) {
    fs.readFile(__dirname + '/index.html',
    function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }
   
        res.writeHead(200);
        res.end(data);
    });
}

var service = {id: 'lisyoen', 
	name: 'Simple Chat', 
	desc: 'Developed by lisyoen', 
	url: 'http://lisyoen.dangsam.com',
	count: 0};
monitor.report(service);

(function schedule() {
	setTimeout(function() {
		monitor.report(service, function() {
			console.log('monitor response');
			schedule();
		});
		console.log('users: ' + service.count);
	}, 10000);
})();

io.sockets.on('connection', function(socket) {
	
	socket.on('client join', function(data) {
		console.log('join');
		var user = {nickname: ''};
		socket.emit('system chat', {message: 'Connected'});
		if (!data) return;
		if (!data.nickname) return;
		user.nickname = data.nickname;
		socket.set('user', user, function(err) {
			if (err) {throw err;}
			socket.emit('system chat', {message: user.nickname + ' entered'});
			socket.broadcast.emit('system chat', {message: user.nickname + ' entered'});
		});
	});

	socket.on('client chat', function(data) {
		console.log(data);
		socket.emit('server echo chat', data);
		socket.broadcast.emit("server chat", data);
		var user = {nickname: data.nickname};
		socket.set('user', user, function(err) {
			if (err) {throw err;}
		});
	});
	
	function echo_exec(cmd, callback) {
		exec(cmd, function(err, stdout, stderr) {
			if (err) {
				console.log(stderr + '\nError:' + err.code, err.code);
			} else {
				console.log(stdout);
			}
			socket.emit('system report', {err: err, stdout: stdout, stderr: stderr});
			
			callback(arguments);
		});
	}
	
	socket.on('git pull', function(data) {
		console.log('git pull');
		echo_exec('git pull', function() {});
	});

	socket.on('restart', function(data) {
		console.log('restart');
		echo_exec('forever restart chat.js', function() {});
	});

	socket.on('disconnect', function() {
		console.log('disconnect');

		socket.get('user', function(err, user) {
			socket.broadcast.emit('system chat', {message: user.nickname + ' left'});
		});

		service.count--;
		monitor.report(service);
	});

	//socket.emit('server info', data);
	//socket.broadcast.emit("server info", data);
	
	service.count++;
	monitor.report(service);
});

