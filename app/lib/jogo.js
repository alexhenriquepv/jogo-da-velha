
const MSG_INICIA = '#inicia'
const MSG_REINICIA = '#reinicia'
const MSG_SIMBOLO = '#simbolo'
const MSG_JOGADA = '#jogada'
const MSG_DESCONEXAO = '#desconexao'
const SERVER_DISCONNECT = 'disconnect'

module.exports = (app) => {

    const io = app.get('io')

    io.on('connection', (socket) => {
        const sala_id = socket.handshake.query.sala_id
        socket.join(sala_id)

        const sala = io.sockets.adapter.rooms[sala_id]
        const jogadores = Object.keys(sala.sockets)

        function onInicia () {
            io.to(sala_id).emit(MSG_INICIA)
        }

        function onJogadorConectado () {
            if (jogadores.length == 1) {
                io.to(sala_id).sockets[socket.id].emit(MSG_SIMBOLO, 'X')
            }
            else if (jogadores.length == 2) {
                io.to(sala_id).sockets[socket.id].emit(MSG_SIMBOLO, 'O')
                onInicia()
            }
        }

        onJogadorConectado()
        socket.on(MSG_REINICIA, onInicia)
        socket.on(SERVER_DISCONNECT, () => io.to(sala_id).emit(MSG_DESCONEXAO))
        socket.on(MSG_JOGADA, dados => io.to(sala_id).emit(MSG_JOGADA, dados))
    })

    return this
}