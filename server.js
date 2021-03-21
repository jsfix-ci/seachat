// Create an ExpressJS application object
const express = require('express')
const app = express()

// Let ExpressJS servers static files
app.use(express.static('public'))

// Create a http.Server object and start listening
const httpServer = app.listen(process.env.PORT || 8000, '0.0.0.0')

// Create WebSocket connection
const server = require('socket.io')(httpServer)

function Message(username, message) {
    return { datetime: new Date().toLocaleString('en', { hour12: false }), username, message }
}

const usernames = {}

// Handle new connections
server.on('connection', (client) => {
    client.on('username', (username) => {
        // username must be unique and not empty, ask client to rename if it is not.
        username = username.trim()
        if (!username || username == 'system' || Object.values(usernames).includes(username)) client.emit('rename')
        else {
            // Welcome the new comer and update userlist for all clients
            usernames[client.id] = username
            // Notes:
            // `server.emit()` ==> send to every clients
            // `client.emit()` ==> send to this client
            // `client.broadcast.emit()` ==> send to every clients except this one
            // see more at https://socket.io/docs/v4/emit-cheatsheet/
            client.emit('message', Message('system', 'Welcome to join us!'))
            client.broadcast.emit('message', Message('system', `<strong>${usernames[client.id]}</strong> joined us.`))
            server.emit('usernames', Object.values(usernames))

            // Broadcast message from client to all clients
            client.on('message', (message) => server.emit('message', Message(usernames[client.id], message)))

            // Handle disconnection and update userlist for all clients
            client.on('disconnect', () => {
                client.broadcast.emit('message', Message('system', `<strong>${usernames[client.id]}</strong> has left.`))
                delete usernames[client.id]
                server.emit('usernames', Object.values(usernames))
            })
        }
    })
})
