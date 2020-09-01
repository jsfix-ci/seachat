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
    const user = { id: client.id, name: '匿名' }
    client.emit('user', user)
    users.push(user)
    io.emit('users', users)
    client.emit('message', new Message('系统', '欢迎来到海洋聊天室'))

    client.on('message', (message) => io.emit('message', new Message(sender = user, content = message)))

    client.on('rename', (name) => {
        users = users.filter(u => u.id != user.id)
        user.name = name
        client.emit('user', user)
        users.push(user)
        io.emit('users', users)
        if (name) client.broadcast.emit('message', new Message('系统', `${user.name} 加入了聊天室`))
    })

    client.on('disconnect', () => {
        if (user.name !== '匿名') {
            io.emit('message', new Message('系统', `${user.name} 离开了聊天室`))
        }
        users = users.filter(u => u.id != user.id)
        io.emit('users', users)
    })
})
