#!/usr/bin/env node

// Create an ExpressJS application object
const express = require('express')
const app = express()

// Let ExpressJS servers static files
app.use(express.static('public'))

// Create Server and WebSocket object
const server = require('http').createServer(app)
const io = require('socket.io')(server)

// Start listening
if (process.env.NODE_ENV != 'test') {
    const host = process.env.HOST || '0.0.0.0'
    const port = process.env.PORT || 8000
    server.listen(port, host, console.log(`seachat server started at http://${host}:${port}/`))
}

const usernames = {}

// Handle new connection
io.on('connection', (client) => {
    client.emit('welcome') // Welcome the new comer
    client.on('username', (username) => {
        // username must be unique and not empty, ask client to rename invalid name.
        username = username.trim()
        if (!username || Object.values(usernames).includes(username)) client.emit('rename')
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
