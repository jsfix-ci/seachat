// Create an ExpressJS application object
const express = require('express')
const app = express()

// Let ExpressJS servers static files
app.use(express.static('public'))

// Create Server and WebSocket object
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 8000
const server = require('http').createServer(app)
const io = require('socket.io')(server)
server.listen(port, host, () => console.log(`server started at http://${host}:${port}/`))

function Message(username, message) {
    return { datetime: new Date().toLocaleString('en', { hour12: false }), username, message }
}

const usernames = {}

// Handle new connections
io.on('connection', (client) => {
    // Welcome the new comer
    client.emit('message', Message('system', 'Welcome to join us!'))

    client.on('username', (username) => {
        // username must be unique and not empty, ask client to rename if it is not.
        username = username.trim()
        if (!username || username == 'system' || Object.values(usernames).includes(username)) client.emit('rename')
        else {
            // update userlist for all clients
            usernames[client.id] = username
            // Notes:
            // `io.emit()` ==> send to every clients
            // `client.emit()` ==> send to this client
            // `client.broadcast.emit()` ==> send to every clients except this one
            // see more at https://socket.io/docs/v4/emit-cheatsheet/
            client.broadcast.emit('message', Message('system', `<strong>${usernames[client.id]}</strong> joined us.`))
            io.emit('usernames', Object.values(usernames))

            // Broadcast message from client to all clients
            client.on('message', (message) => io.emit('message', Message(usernames[client.id], message)))

            // Handle disconnection and update userlist for all clients
            client.on('disconnect', () => {
                client.broadcast.emit('message', Message('system', `<strong>${usernames[client.id]}</strong> has left.`))
                delete usernames[client.id]
                io.emit('usernames', Object.values(usernames))
            })
        }
    })
})

module.exports = server
