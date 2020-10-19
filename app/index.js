const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const consign = require('consign')

const port = process.env.PORT || 3000

app.use(express.static(__dirname + '/../public'))

app.set('view_dir', __dirname + '/views')
app.set('io', io)

consign({ cwd: 'app' })
    .include('config')
    .include('lib')
    .into(app)

http.listen(port, () => {
    console.log(`App running on port ${port}`)
})
