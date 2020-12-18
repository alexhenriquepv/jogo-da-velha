
const USERNAME = sessionStorage.getItem("username")
if (!USERNAME) window.location.href = "/"

const MAX_TAB_LEN = 4
const JOGADOR_X = 'X'
const JOGADOR_O = 'O'

/* Constantes de manipulação do servidor socket */
const MSG_ENVIA_CONVITE = '#MSG_ENVIA_CONVITE'
const MSG_RECEBE_CONVITE = '#MSG_RECEBE_CONVITE'
const MSG_CONVITE_ACEITO = '#MSG_CONVITE_ACEITO'
const MSG_INICIA = '#MSG_INICIA'
const MSG_REINICIA = '#MSG_REINICIA'
const MSG_MEU_USUARIO = '#MSG_MEU_USUARIO'
const MSG_SIMBOLO = '#MSG_SIMBOLO'
const MSG_JOGADA = '#MSG_JOGADA'
const MSG_JOGADORES = '#MSG_JOGADORES'
const MSG_DESCONEXAO = '#MSG_DESCONEXAO'
const MSG_SAIR_PARTIDA = '#MSG_SAIR_PARTIDA'
const SERVER_CONNECT = 'connect'
const SERVER_DISCONNECT = 'connect_error'
/* =============== */

class Jogador {
  constructor(id, nome, atual) {
    this.id = id
    this.nome = nome
	this.atual = atual
  }
}

class Tabuleiro {
    constructor(id_sala, solicitante, convidado) {
        this.id_sala = id_sala
        this.solicitante = solicitante
        this.convidado = convidado
    }
}

const socket = io({
  query: { username: USERNAME }
})

const bus = new Vue()

const app = new Vue({
    el: "#app",
    data: {
        jogador: null,
        jogando: false,
        jogadores: [],
        tabuleiros: []
    },
    methods: {
        convidaJogador (convidado) {
          if (this.tabuleiros.length < MAX_TAB_LEN) {
            socket.emit(MSG_ENVIA_CONVITE, {
                id_solicitante: this.jogador.id,
                id_convidado: convidado.id
            })
			swal("Convite enviado", "Aguarde a resposta")
          }
        },
        buscaJogador (id) {
            for (let i = 0; i < this.jogadores.length; i++) {
              if (this.jogadores[i].id == id) {
                return this.jogadores[i]
              }
            }
        },
        buscaTabuleiro (id_sala) {
            for (let i = 0; i < this.tabuleiros.length; i++) {
              if (this.tabuleiros[i].id_sala == id_sala) {
                return this.tabuleiros[i]
              }
            }
        },
        criaTabuleiro (data) {
            const dados_solicitante = this.buscaJogador(data.id_solicitante) || this.jogador
            const dados_convidado = this.buscaJogador(data.id_convidado) || this.jogador
			const tabuleiro = new Tabuleiro(
				data.id_sala,
				new Jogador(dados_solicitante.id, dados_solicitante.nome),
				new Jogador(dados_convidado.id, dados_convidado.nome)
			)
            this.tabuleiros.push(tabuleiro)
        },
        listaJogadores (jogadores) {
          this.jogadores = []
          jogadores.forEach(j => {
              if (j.id != this.jogador.id) {
                  this.jogadores.push(new Jogador(j.id, j.nome))
              }
          })
          bus.$emit('list:jogadores', this.jogadores)
	  	},
	  	defineSimbolos (data) {
			for (let i = 0; i < this.tabuleiros.length; i++) {
				if (this.tabuleiros[i].id_sala == data.id_sala) {
					this.tabuleiros[i].solicitante.simbolo = JOGADOR_X
					this.tabuleiros[i].convidado.simbolo = JOGADOR_O

					if (this.tabuleiros[i].solicitante.simbolo == data.simbolo) {
						this.tabuleiros[i].solicitante.atual = true
					}
					else {
						this.tabuleiros[i].convidado.atual = true
					}
					bus.$emit("inicia", data.id_sala)
	                break
				}
            }
		},
		finalizarTabuleiro (id_sala) {
			const t = this.buscaTabuleiro(id_sala)
			if (t) {
				let index = this.tabuleiros.indexOf(t)
				this.tabuleiros.splice(index, 1)
			}
		},
		jogadorEmSala (id_jogador) {
			for(let i = 0; i < this.tabuleiros.length; i++) {
				if (this.tabuleiros[i].solicitante.id == id_jogador) return true
				else if (this.tabuleiros[i].convidado.id == id_jogador) return true
				return false
			}
		}
    },
    created () {
        socket.on(SERVER_CONNECT, () => console.log(`conectado como ${socket.id}`))
        socket.on(MSG_INICIA, this.criaTabuleiro)
		socket.on(MSG_SIMBOLO, this.defineSimbolos)
        socket.on(MSG_JOGADORES, this.listaJogadores)

        socket.on(MSG_MEU_USUARIO, (meu_usuario) => {
            this.jogador = new Jogador(meu_usuario.id, meu_usuario.nome)
        })

        socket.on(MSG_RECEBE_CONVITE, async (data) => {
            const solicitante = this.buscaJogador(data.id_solicitante)
            const msg = await swal({
				title: "Hora do show",
				text: `${solicitante.nome} desafiou você!`,
				buttons: ["Recusar","Aceitar"],
			})
            if (msg) {
              socket.emit(MSG_CONVITE_ACEITO, {
                  id_sala: data.id_sala,
                  id_solicitante: solicitante.id,
                  id_convidado: this.jogador.id
              })
            }
        })

		socket.on(MSG_JOGADA, (data) => bus.$emit("jogada", data))

		// Quando algum adversário se desconecta do jogo
        socket.on(MSG_DESCONEXAO, (id) => {
			const j = this.buscaJogador(id)
			const index = this.jogadores.indexOf(j)
			if (this.jogadorEmSala(id)) {
				swal(`${j.nome} saiu`)
			}
			this.jogadores.splice(index, 1)
            bus.$emit('list:jogadores', this.jogadores)

			for (let t in this.tabuleiros) {
				if (this.tabuleiros[t].solicitante.id == id ||
					this.tabuleiros[t].convidado.id == id) {
					this.finalizarTabuleiro(this.tabuleiros[t].id_sala)
				}
			}
        })

		bus.$on("convida-jogador", this.convidaJogador)
        bus.$on("jogador-saiu", this.finalizarTabuleiro)
		socket.on(MSG_SAIR_PARTIDA, this.finalizarTabuleiro)
    }
})
