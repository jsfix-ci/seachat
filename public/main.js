const client = io()
let me = { id: "", name: "" }

function setName() {
    const name = prompt("Enter your name").trim()
    client.emit("name", name)
}

window.onload = function () {
    setName()
}

client.on("user", user => me = user)

client.on("message", message => {
    const messagesDIV = document.querySelector("div.messages")
    const div = document.createElement("div")
    div.className = "message"
    div.innerHTML = `<p class="meta"><span class="name">${message.sender.id == me.id ? 'me' : (message.sender.name == '' ? 'anonymous' : message.sender.name)}</span> @ <span class="time">${message.time}</span></p>
                    <p class="content">${message.content}</p>`
    messagesDIV.append(div)
    messagesDIV.scrollTop = messagesDIV.scrollHeight
})

client.on("users", users => {
    const usersDIV = document.querySelector("div.users")
    usersDIV.innerHTML = ""
    for (user of users) {
        if (user.name) {
            const p = document.createElement("p")
            p.className = user.id == me.id ? "user me" : "user"
            p.innerHTML = user.name
            usersDIV.append(p)
        }
    }
    const anonymous = users.filter(u => u.name === '').length
    if (anonymous > 0) {
        const p = document.createElement("p")
        p.className = "user anonymous"
        p.innerHTML = `... and ${anonymous} more anonymous`
        usersDIV.append(p)
    }
})

function sendMessage() {
    const input = document.getElementById("message")
    const message = input.value.trim()
    if (message !== '') client.emit("message", message)
    input.value = ""
    input.focus()
}

function onKeyUp(event) {
    if (event.keyCode == 13) sendMessage()
}
