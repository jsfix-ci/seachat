/**
 * SeaChat Client
 */

const client = io()

// load username from localStorage and send it to server
let username = localStorage.getItem('username') || ''
client.on('connect', () => client.emit('username', username))

// user should be asked to rename himself if his name is taken
client.on('rename', () => {
    username = (!!username ? prompt(`Username "${username}" is taken. Enter another one, please.`) : prompt('Enter your name, please.') || '').trim()
    localStorage.setItem('username', username)
    client.emit('username', username)
})

// receive usernames from server and update the userlist on page
client.on('usernames', (usernames) => {
    usernamesContainer.innerHTML = ''
    for (const name of usernames) {
        const p = document.createElement('p')
        p.className = name == username ? 'user me' : 'user'
        p.innerText = name
        usernamesContainer.append(p)
    }
})

// Show different kinds of message from the server
client.on('welcome', () => showMessage('system', 'Welcome to join us!'))
client.on('join', (name) => showMessage('system', `<strong>${name}</strong> joined us.`))
client.on('left', (name) => showMessage('system', `<strong>${name}</strong> has left.`))
client.on('message', ({ username, message }) => showMessage(username, message))

// send message from client to server
messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const message = messageInput.value.trim()
    message && client.emit('message', message)
    messageInput.value = ''
    messageInput.focus()
})

// show message from server on to the page
const showMessage = (sender, message) => {
    const datetime = new Date().toLocaleString('en', { hour12: false })
    const div = document.createElement('div')
    div.className = sender === username ? 'message my-message' : 'message'
    div.innerHTML = `<p class='meta'><span class='name'>@${sender}</span> <span class='time'>${datetime}</span></p>
    <p class='content'>${message}</p>`
    messagesContainer.append(div)
    messagesContainer.scrollTop = messagesContainer.scrollHeight // auto scroll down to bottom
}
