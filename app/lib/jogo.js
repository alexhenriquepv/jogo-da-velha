module.exports = (app) => {

    const io = app.get('io')

    io.on('connection', (socket) => {
        const sala_id = socket.handshake.query.sala_id
        socket.join(sala_id)

        const sala = io.sockets.adapter.rooms[sala_id]
        const jogadores = Object.keys(sala.sockets)

        function onInicia () {
            io.to(sala_id).emit('#inicia')
        }

        function onJogadorConectado () {
               console.log('jogad: ',jogadores)
            if (jogadores.length == 1) {
                io.to(sala_id).sockets[socket.id].emit('#simbolo', 'X')
            }
            else if (jogadores.length == 2) {
                io.to(sala_id).sockets[socket.id].emit('#simbolo', 'O')
                onInicia()
            }
        }

        onJogadorConectado()
        socket.on('#reinicia', onInicia)
        socket.on('disconnect', () => io.to(sala_id).emit('#desconexao'))
        socket.on('#jogada', dados => io.to(sala_id).emit('#jogada', dados))
    })

    return this
}