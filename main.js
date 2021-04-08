#!/usr/bin/env node
const { server } = require('./server')
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 8000
server.listen(port, host, console.log(`seachat server started at http://${host}:${port}/`))
