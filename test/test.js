const expect = require('chai').expect
const io = require('socket.io-client')
const app = require('../server.js')
const url = 'http://localhost:8000'
const options = {
    transports: ['websocket'],
    'force new connection': true,
}

it('new connection should receive a welcome message', (done) => {
    const client = io.connect(url, options)
    client.on('message', ({ username, message }) => {
        expect(username).to.equal('system')
        expect(message).to.equal('Welcome to join us!')
        client.disconnect()
        done()
    })
})

it('empty username should be reject', (done) => {
    const client = io.connect(url, options)
    const username = ''
    client.on('rename', () => {
        client.disconnect()
        done()
    })
    client.on('connect', () => client.emit('username', username))
})

it('username "system" should be reject', (done) => {
    const client = io.connect(url, options)
    const username = 'system'
    client.on('rename', () => {
        client.disconnect()
        done()
    })
    client.on('connect', () => client.emit('username', username))
})

it('after send username to server should receive username list', (done) => {
    const client = io.connect(url, options)
    const username = 'test'
    client.on('usernames', (usernames) => {
        expect(usernames[0]).to.equal(username)
        client.disconnect()
        done()
    })
    client.on('connect', () => client.emit('username', username))
})
