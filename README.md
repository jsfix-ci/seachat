# SeaChat

chat app example using socket.io

![screenshot](public/screenshot.png)

## Run

``` shell
npm install
npm start
firefox http://localhost:8000
```

## Note

At server side:

- `io.emit()` means => send to every client
- `client.emit()` means => send to the client
- `client.broadcast.emit()` means => send to every but except this client

## History

- Version 1.0.2
  - remove `moment` from dependencies.
  - add server side logging
  - make code clean and readable
  - rewrite comments
  - anonymous is not allowed
- Version 1.0.1
  - remove `uuid` from dependencies, it's not needed for this app.
  - client = io(); because `client.id` is just the `client.io.id`.
  - minor bug fixed
- Version 1.0.0
  - first release
