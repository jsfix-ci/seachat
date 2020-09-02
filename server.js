const express = require("express")
const path = require("path")
const uuid = require("uuid")
const moment = require("moment")
const app = express()
const server = require("http").createServer(app)
const io = require("socket.io")(server)
const host = process.env.PORT || "0.0.0.0"
const port = process.env.PORT || 8000
server.listen(port, host, () => console.info(`chat server is running at ${host}:${port}`))

app.use(express.static(path.join(__dirname, "public")))

let users = []

class Message {
    constructor(content, sender = { id: 0, name: 'system' }) {
        this.id = uuid.v4()
        this.sender = sender
        this.content = content
        this.time = moment().format('HH:mm a')
    }
}

io.on("connection", client => {
    const user = { id: client.id, name: "" }
    users.push(user)
    client.emit("user", user)
    io.emit("users", users)
    client.emit("message", new Message('Welcome to SeaChat ...'))

    client.on("name", (name) => {
        name = name.trim()
        if (name && users.filter(u => u.name == name).length == 0) {
            user.name = name
            client.emit("user", user)
            io.emit("users", users)
            client.broadcast.emit("message", new Message(`<strong>${name}</strong> joined us`))
        }
    })

    client.on("message", (message) => {
        io.emit("message", new Message(message, user))
    })

    client.on("disconnect", () => {
        users = users.filter(u => u.id !== client.id)
        io.emit("users", users)
        if (user.name) {
            client.broadcast.emit("message", new Message(`<strong>${user.name}</strong> has left`))
        }
    })
})
