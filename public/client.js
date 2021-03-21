const client = io()

// Load my username from localStorage and send it to server
let myUsername = localStorage.getItem('username') || ''
client.on('connect', () => client.emit('username', myUsername))

// Try another nmae if current one is invalid
client.on('rename', () => {
    myUsername = !!myUsername ? prompt(`Username "${myUsername}" is taken. Enter another one, please.`) : prompt('Enter your name, please.') || ''
    localStorage.setItem('username', myUsername)
    client.emit('username', myUsername)
})

// Update userlist from server
client.on('usernames', (usernames) => {
    usernamesContainer.innerHTML = ''
    for (const username of usernames) {
        const p = document.createElement('p')
        p.className = username == myUsername ? 'user me' : 'user'
        p.innerText = username
        usernamesContainer.append(p)
    }
})

// Show message from server
client.on('message', ({ datetime, username, message }) => {
    const div = document.createElement('div')
    div.className = username === myUsername ? 'message my-message' : 'message'
    div.innerHTML = `<p class='meta'><span class='name'>@${username}</span> <span class='time'>${datetime}</span></p>
    <p class='content'>${message}</p>`
    messagesContainer.append(div)
    messagesContainer.scrollTop = messagesContainer.scrollHeight // auto scroll down to bottom
})

// Send message to server
messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const message = messageInput.value.trim()
    message && client.emit('message', message)
    messageInput.value = ''
    messageInput.focus()
})
