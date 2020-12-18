const Chance = require('chance')

const MSG_ENVIA_CONVITE = '#MSG_ENVIA_CONVITE'
const MSG_RECEBE_CONVITE = '#MSG_RECEBE_CONVITE'
const MSG_CONVITE_ACEITO = '#MSG_CONVITE_ACEITO'
const MSG_MEU_USUARIO = '#MSG_MEU_USUARIO'
const MSG_SIMBOLO = '#MSG_SIMBOLO'
const MSG_JOGADA = '#MSG_JOGADA'
const MSG_JOGADORES = '#MSG_JOGADORES'
const MSG_INICIA = '#MSG_INICIA'
const MSG_DESCONEXAO = '#MSG_DESCONEXAO'
const MSG_REINICIA = '#MSG_REINICIA'
const MSG_SAIR_PARTIDA = '#MSG_SAIR_PARTIDA'
const SERVER_DISCONNECT = 'disconnect'

let jogadores = []

function criaJogador (id, nome) {
  for (let i = 0; i < jogadores.length; i++) {
    if (jogadores[i].nome == nome) {
      nome = nome + '#'
      break
    }
  }
  return { id, nome }
}

function excluiJogador (id) {
    for (let i = 0; i < jogadores.length; i++) {
      if (jogadores[i].id == id) {
        jogadores.splice(i, 1)
        break
      }
    }
}

module.exports = (app) => {

    const chance = new Chance()
    const io = app.get('io')

    io.on('connection', (socket) => {
		// const token = socket.handshake.query.token
      const novo_jogador = criaJogador(socket.id, socket.handshake.query.username)
      jogadores.push(novo_jogador)
      io.to(socket.id).emit(MSG_MEU_USUARIO, novo_jogador)
      io.emit(MSG_JOGADORES, jogadores)

      socket.on(MSG_ENVIA_CONVITE, (data) => {
          const id_sala = chance.string({ length: 5 })
          socket.join(id_sala)
          io.to(data.id_convidado).emit(MSG_RECEBE_CONVITE, {
              id_solicitante: data.id_solicitante,
              id_sala: id_sala
          })
      })

      socket.on(MSG_CONVITE_ACEITO, (data) => {
          socket.join(data.id_sala)
          io.to(data.id_solicitante).emit(MSG_INICIA, data)
          io.to(data.id_convidado).emit(MSG_INICIA, data)
          io.to(data.id_solicitante).emit(MSG_SIMBOLO, { simbolo: 'X', id_sala: data.id_sala })
          io.to(data.id_convidado).emit(MSG_SIMBOLO, { simbolo: 'O', id_sala: data.id_sala })
      })

      socket.on(SERVER_DISCONNECT, () => {
          excluiJogador(socket.id)
          io.emit(MSG_DESCONEXAO, socket.id)
      })

	  socket.on(MSG_SAIR_PARTIDA, (id_sala) => {
          socket.leave(id_sala)
		  socket.broadcast.emit(MSG_SAIR_PARTIDA, id_sala)
      })

      socket.on(MSG_JOGADA, data => {
		  io.to(data.id_sala).emit(MSG_JOGADA, {
			  id_sala: data.id_sala,
			  id_bloco: data.id_bloco
		  })
	  })
    })

    return this
}
