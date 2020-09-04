const client = { id: "", io: io() }  // websocket client object
const messageInput = document.getElementById("message")
const usersContainer = document.getElementById("users")
const messagesContainer = document.getElementById("messages")

// send my name to server
window.onload = () => {
    try {
        const name = prompt("Please enter your name").trim()
        name && client.io.emit("name", name)
    } catch (error) { }
}
// receive and store my id from server
client.io.on("id", id => client.id = id)
// receive user list from server and update dom
client.io.on("users", users => {
    const namedUsers = users.filter(user => user.name)
    const countOfAnonymous = users.length - namedUsers.length
    usersContainer.innerHTML = ""
    namedUsers.forEach(user => {
        const p = document.createElement("p")
        p.className = user.id === client.id ? "user me" : "user"
        p.innerText = user.name
        usersContainer.append(p)
    })
    if (countOfAnonymous > 0) {
        const p = document.createElement("p")
        p.className = "user anonymous"
        p.innerHTML = `... and ${countOfAnonymous} more anonymous`
        usersContainer.append(p)
    }
})
// receive message from server and update dom
client.io.on("message", message => {
    const div = document.createElement("div")
    message.sender.id === client.id && (message.sender.name = 'me')
    div.className = "message"
    div.innerHTML = `<p class="meta"><span class="name">${message.sender.name || 'anonymous'}</span> @ <span class="time">${message.time}</span></p>
                    <p class="content">${message.content}</p>`
    messagesContainer.append(div)
    messagesContainer.scrollTop = messagesContainer.scrollHeight  // auto scroll down to bottom
})

function sendMessage() {
    const message = messageInput.value.trim()
    message && client.io.emit("message", message)
    messageInput.value = ""
    messageInput.focus()
}

function onKeyUp(event) { event.keyCode === 13 && sendMessage() }
