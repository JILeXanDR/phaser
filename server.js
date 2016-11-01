var app = require('http').createServer(handler),
    io = require('socket.io')(app),
    fs = require('fs');

app.listen(8888);

function handler(req, res) {

    var url = req.url;

    if (url === '/') {
        url += 'index.html';
    }

    var fileName = __dirname + url;

    fs.readFile(fileName, function (err, data) {

        if (err) {
            res.writeHead(404);
            return res.end();
        }

        res.writeHead(200);
        res.end(data);
    });
}

var between = function (min, max) {
    return Math.floor(Math.random() * 10);
};

io.on('connection', function (socket) {

    //setInterval(function () {
    //    socket.emit('bomb', {coordinates: [between(1, 10), between(1, 10)]});
    //}, 2000);

    socket.on('new_player', function (data) {
        socket.emit('new_player', data);
    });

    socket.on('player_move', function (data) {
        socket.broadcast.emit('player_move', data);
    });

});