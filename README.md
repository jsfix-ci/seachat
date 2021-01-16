# SeaChat

chat app example using socket.io

![screenshot](screenshot.png)

## Run

``` shell
npm install
npm start
firefox http://localhost:8000
```

## History

- Version 1.0.1
  - remove `uuid` from dependencies, it's not needed for this app.
  - client = io(); because `client.id` is just the `client.io.id`.
  - minor bug fixed
- Version 1.0.0
  - first release
