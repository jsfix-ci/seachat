const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const now = () => (new Date()).toLocaleString();
const users = {};
app.use(express.static('public'));
server.listen(8000, 'localhost');

// handle websocket connection and comunication events
io.on('connection', client => {
    console.log(`[${client.id}]: connected`);

    // handle user's name
    client.on('name', name => {
        // name should be not empty and unique
        if (!name || name == 'system' || Object.values(users).includes(name)) return client.emit('rename', name);
        // say hello to user, set user's name and broadcast the updated users list
        client.emit('message', null, 'system', now(), 'Welcome to SeaChat ...');
        users[client.id] = name;
        io.emit('users', users);
        console.log(`[${client.id}]: set name to "${name}"`);
    });

    // broadcast user message to every one
    client.on('message', message => {
        io.emit('message', client.id, users[client.id], now(), message);
        console.log(`[${client.id}]: "${users[client.id]}" said "${message}"`);
    });

    // handle user disconnection
    client.on('disconnect', () => {
        console.log(`[${client.id}]: disconnected`);
        if (users[client.id]) {
            client.broadcast.emit('message', null, 'system', now(), `<strong>${users[client.id]}</strong> has left`);
            delete users[client.id];
            io.emit('users', users);
        }
    });
});
