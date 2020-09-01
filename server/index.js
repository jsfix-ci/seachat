const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const moment = require('moment')
const uuid = require('uuid')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000

server.listen(port, host, () => console.log(`server is listening on port ${port}`))

class Message {
    constructor(sender, content) {
        this.id = uuid.v4()
        this.sender = sender
        this.content = content
        this.time = moment().format('HH:mm a')
    }
}

let users = []
io.on('connection', client => {
    const id = client.id
    console.log(`client ${id} joined`)
    users.push(id)
    client.emit('id', id)
    io.emit('users', users)
    client.emit('message', new Message('系统', '欢迎来到海洋聊天室'))
    client.broadcast.emit('message', new Message('系统', `${id} 加入了聊天室`))

    client.on('message', (message) => io.emit('message', new Message(sender = id, content = message)))

    client.on('disconnect', () => {
        console.log(`client ${id} left`)
        io.emit('message', new Message('系统', `${id} 离开了聊天室`))
        users = users.filter(_ => _ != id)
        io.emit('users', users)
    })
})
