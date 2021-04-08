// Create an ExpressJS application object
// and let it servers static files
const express = require('express')
const app = express()
app.use(express.static('public'))

// Create HTTP Server and SocketIO object
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const usernames = {}

// Handle new connection
io.on('connection', (client) => {

    // Welcome the new comer
    client.emit('welcome')

    client.on('username', (username) => {
        username = username.trim()

        // username must be unique and not empty, ask client to rename invalid name.
        if (!username || Object.values(usernames).includes(username)) client.emit('rename')

        // save username and serve this user
        else {
            // update userlist for all clients
            usernames[client.id] = username
            // Notes:
            // `io.emit()` ==> send to every clients
            // `client.emit()` ==> send to this client
            // `client.broadcast.emit()` ==> send to every clients except this one
            // see more at https://socket.io/docs/v4/emit-cheatsheet/
            client.broadcast.emit('join', username)
            io.emit('usernames', Object.values(usernames))

            // Broadcast message from client to all clients
            client.on('message', (message) => io.emit('message', { username, message }))

            // Handle disconnection and update userlist for all clients
            client.on('disconnect', () => {
                client.broadcast.emit('left', usernames[client.id])
                delete usernames[client.id]
                io.emit('usernames', Object.values(usernames))
            })
        }
    })
})

module.exports = { server, io }
