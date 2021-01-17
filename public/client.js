const client = io();  // websocket client object
const messageInput = document.getElementById('message');
const usersContainer = document.getElementById('users');
const messagesContainer = document.getElementById('messages');

// send your name to server
client.on('connect', () => client.emit('name', prompt('Please enter your name.')));
client.on('rename', name => client.emit('name', name ?
    prompt(`The name "${name}" is taken. Please enter another name.`) :
    prompt('Please MUST enter your name.')
));

// handle user list from server
client.on('users', users => {
    usersContainer.innerHTML = '';
    for (const [id, name] of Object.entries(users)) {
        const p = document.createElement('p');
        p.className = id === client.id ? 'user me' : 'user';
        p.innerText = name;
        usersContainer.append(p);
    }
});

// show message incoming from server
client.on('message', (id, name, time, message) => {
    const div = document.createElement('div');
    id === client.id && (name = 'me');
    div.className = 'message';
    div.innerHTML = `<p class='meta'><span class='name'>${name}</span> @ <span class='time'>${time}</span></p>
    <p class='content'>${message}</p>`;
    messagesContainer.append(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;  // auto scroll down to bottom
});

// send message to server
function sendMessage() {
    const message = messageInput.value.trim();
    message && client.emit('message', message);
    messageInput.value = '';
    messageInput.focus();
}
messageInput.addEventListener('keyup', event => event.keyCode === 13 && sendMessage());
