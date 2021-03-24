const clinet_io = require('socket.io-client')
const axios = require('axios')
const { server, io } = require('../src/server.js')
const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 8000
const url = `http://${host}:${port}`
const options = {
    transports: ['websocket'],
    'force new connection': true,
    'reconnection delay': 0,
    'reopen delay': 0,
}

let client1, client2
const clinet1Username = 'John'
const clinet2Username = 'Jane'

beforeAll((done) => {
    server.listen(port, host)
    client1 = clinet_io.connect(url, options)
    client1.emit('username', clinet1Username)
    client2 = clinet_io.connect(url, options)
    axios.defaults.adapter = require('axios/lib/adapters/http')
    done()
})

afterAll((done) => {
    client1.connected && client1.disconnect()
    client2.connected && client2.disconnect()
    io.close()
    server.close()
    done()
})

describe('new connection', () => {
    test('receive welcome', (done) => client1.on('welcome', done))
})

describe('set username', () => {
    test('reject empty username', (done) => {
        client2.emit('username', '')
        client2.on('rename', done)
    })
    test('reject occupied username', (done) => {
        client2.emit('username', clinet1Username)
        client2.on('rename', done)
    })
    test('receive joining notice', (done) => {
        client2.emit('username', clinet2Username)
        client1.on('join', (username) => {
            expect(username).toBe(clinet2Username)
            done()
        })
    })
    test('receive all usernames', (done) => {
        client2.on('usernames', (usernames) => {
            expect(usernames).toEqual([clinet1Username, clinet2Username])
            done()
        })
    })
})

describe('test chatting', () => {
    const message = 'hello, world!'
    test(`client1 heards client2 says "${message}"`, (done) => {
        client2.emit('message', message)
        client1.on('message', ({ username, message }) => {
            expect(username).toBe(clinet2Username)
            expect(message).toBe(message)
            done()
        })
    })
})

describe('disconnection', () => {
    test('receive leaving notice', (done) => {
        client2.disconnect()
        client1.on('left', (username) => {
            expect(username).toBe(clinet2Username)
            client1.on('usernames', (usernames) => {
                expect(usernames).toEqual([clinet1Username])
                done()
            })
        })
    })
})

describe('http server response states', () => {
    for (let filename of ['index.html', 'favicon.ico', 'style.css', 'client.js']) {
        test(`${filename} OK`, async (done) => {
            const response = await axios.get(`${url}/${filename}`)
            expect(response.status).toBe(200)
            done()
        })
    }
})
