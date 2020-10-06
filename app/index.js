const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const port = 3000 || process.env.PORT

app.use(express.static(__dirname + '/../public'))

app.get('/', (req, res) => {
console.log(__dirname)
  res.sendFile(__dirname + '/views/index.html')
})

io.on('connection', socket => {
    socket.join('velha')
    console.log(`usuario conectado: ${socket.id}`)

    const sala = io.in('velha')
    const usuarios = Object.keys(sala.sockets)
    console.log('total: ' + usuarios.length)

    if (usuarios.length == 2) {
        io.to(usuarios[0]).emit('simbolo', 'O')
        io.to(usuarios[1]).emit('simbolo', 'X')
        io.to('velha').emit('inicia')
    }

    socket.on('disconnected', () => {
        console.log('usuario desconectado')
    })

    socket.on('jogada', dados => {
        console.dir(dados)
        socket.broadcast.emit('jogada', dados)
    })
})

http.listen(port, () => {
    console.log(`App running on port ${port}`)
})
