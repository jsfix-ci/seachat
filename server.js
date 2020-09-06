const express = require("express")
const path = require("path")
const uuid = require("uuid")
const moment = require("moment")
const app = express()
const server = require("http").createServer(app)
const io = require("socket.io")(server)
const host = process.env.PORT || "0.0.0.0"
const port = process.env.PORT || 8000

class Message {
    constructor(content, sender = { id: null, name: "system" }) {
        this.id = uuid.v4()
        this.sender = sender
        this.content = content
        this.time = moment().format("HH:mm")
    }
}

let users = []
function broadcastUserlist() { io.emit("users", users) }

// NOTE:
// io.emit() => send to every client
// client.emit() => send to the client
// client.broadcast.emit() => send to every but except this client

// handle websocket comunication
io.on("connection", client => {
    // handle new connection
    client.emit("id", client.id)  // tell client his id
    client.emit("message", new Message("Welcome to SeaChat ..."))  // and say hello
    const currentUser = { id: client.id, name: "" }  // create user object for this connection
    users.push(currentUser) && broadcastUserlist()  // ... and store it to the user list and broadcast the updated user list

    // handle user name
    client.on("name", name => {
        name = name.trim()
        // name can be either empty or unique
        if (name === "" || users.filter(user => user.name == name).length === 0) {
            name && client.broadcast.emit("message", new Message(`<strong>${name}</strong> has joined us`))
            currentUser.name = name
            broadcastUserlist()
        }
    })

    // handle user message
    client.on("message", message => io.emit("message", new Message(message, currentUser)))

    // handle user disconnection
    client.on("disconnect", () => {
        users = users.filter(user => user.id !== client.id)
        broadcastUserlist()
        currentUser.name && client.broadcast.emit("message", new Message(`<strong>${currentUser.name}</strong> has left`))
    })
})

// serve static public files and start the server
app.use(express.static(path.join(__dirname, "public")))
server.listen(port, host, () => console.info(`chat server is running at ${host}:${port}`))
