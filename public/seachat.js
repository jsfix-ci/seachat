const client = io();  // websocket client object
const messageInput = document.getElementById('message');
const usersContainer = document.getElementById('users');
const messagesContainer = document.getElementById('messages');

// send name to server
client.emit('name', prompt('Please enter your name'));

// handle user list from server
client.on('users', users => {
    const namedUsers = users.filter(user => user.name);
    const countOfAnonymous = users.length - namedUsers.length;
    usersContainer.innerHTML = '';
    namedUsers.forEach(user => {
        const p = document.createElement('p');
        p.className = user.id === client.id ? 'user me' : 'user';
        p.innerText = user.name;
        usersContainer.append(p);
    });
    if (countOfAnonymous > 0) {
        const p = document.createElement('p');
        p.className = 'user anonymous';
        p.innerHTML = `... and ${countOfAnonymous} more anonymous`;
        usersContainer.append(p);
    }
});

// handle message from server
client.on('message', message => {
    const div = document.createElement('div');
    message.sender.id === client.id && (message.sender.name = 'me');
    div.className = 'message';
    div.innerHTML = `<p class='meta'><span class='name'>${message.sender.name || 'anonymous'}</span> @ <span class='time'>${message.time}</span></p>
    <p class='content'>${message.content}</p>`;
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
