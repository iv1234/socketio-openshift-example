var config = require('./config');
var express = require('express');
var http = require('http');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var serviceSocket = null;
var ip = '127.0.0.1', port = 8081;
console.log("Trying to start server with config:", config.serverip + ":" + config.serverport);
server.listen(config.serverport, config.serverip, function () {
  console.log("Server running @ http://" + config.serverip + ":" + config.serverport);
});
var proxy = require('express-http-proxy');
 
app.use('/data', proxy('127.0.0.1:8081'));
app.use('/.well-known', proxy('127.0.0.1:8081'));

io.on('connection', function (socket) {
  try {
    if (serviceSocket) {
      serviceSocket = undefined;
          server.close();
    }
  } catch (e) {
    console.error(e);
  }
  serviceSocket = socket;
  var p2s = {};
  var s2p = {};
  var net = require('net');
  function clear(peerSocket) {
    p2s[s2p[peerSocket]] = undefined;
    s2p[peerSocket] = undefined;
  }
  var server = net.createServer(function (peerSocket) {
    peerSocket.on('close', function (message) {
      if (serviceSocket && s2p[peerSocket]) {
        serviceSocket.emit('data', s2p[peerSocket] + 'close');
        clear(peerSocket);
      }
    });
    peerSocket.on('end', function (message) {
      if (serviceSocket && s2p[peerSocket]) {
        serviceSocket.emit('data', s2p[peerSocket] + 'end');
        clear(peerSocket);
      }
    });
    peerSocket.on('error', function (message) {
      clear(peerSocket);
    });
    peerSocket.on('data', function (message) {
      if (serviceSocket) {
        var port = String.fromCharCode(((peerSocket.remotePort >> 8) & 255)) + String.fromCharCode(((peerSocket.remotePort) & 255));
        p2s[port] = peerSocket;
        s2p[peerSocket] = port;
        serviceSocket.emit('data', port + message);
      } else {
        peerSocket.end();
      }
    });
  });
  server.listen(port, ip);
  console.log('Server accepting connection on port: ' + ip + ':' + port);
  serviceSocket.on('data', function (data) {
    if (data.toString().substring(2) == "end") {
      try {
        p2s[data.toString().substring(0, 2)].end();
      } catch (e) {
        console.error(e);
      }
      clear(p2s[data.toString().substring(0, 2)]);
    } else if (data.toString().substring(2) == "close") {
      try {
        p2s[data.toString().substring(0, 2)].close();
      } catch (e) {
        console.error(e);
      }
      clear(p2s[data.toString().substring(0, 2)]);
    } else {
      try {
        p2s[data.toString().substring(0, 2)].write(data.toString().substring(2));
      } catch (e) {
        console.error(e);
      }
    }
  });
  socket.emit('hello', 'hello');
  socket.on('ping', function (data) {
    console.log("received ping from client: ", data);
    socket.emit('pong', { id: data.id });
  });
  socket.on('disconnect', function () {
    console.log('disconnected...');
    serviceSocket = undefined;
    server.close();
  });
});
