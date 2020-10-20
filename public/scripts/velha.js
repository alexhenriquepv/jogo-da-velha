
/* Constantes das Cores e elementos HTML*/
const COR_VITORIA = '#0F0'
const COR_BLOCO = '#F7FE2E'
const COR_TEXTO_BLOCO = '#bc5e00'
const blocos = document.querySelectorAll('.bloco')
const btn_reiniciar = document.getElementById('reiniciar')
const label_jogador = document.getElementById('jogador')

/* Constantes de manipulação do servidor socket */
const MSG_INICIA = '#inicia'
const MSG_REINICIA = '#reinicia'
const MSG_SIMBOLO = '#simbolo'
const MSG_JOGADA = '#jogada'
const MSG_DESCONEXAO = '#desconexao'
const SERVER_CONNECT = 'connect'
const SERVER_DISCONNECT = 'connect_error'

let MEU_SIMBOLO, JOGADOR_ATUAL, VENCEDOR

function inicia () {
	for (let i = 0; i < 9; i++) {
		blocos[i].innerText = ''
		blocos[i].style.color = COR_BLOCO
		blocos[i].style.backgroundColor = COR_BLOCO
	}

	VENCEDOR = null

	// A primeira jogada sempre vai ser do jogador 'O'
	defineJogador('O')
}

function blocoVazio (bloco) {
	return bloco.innerText == ''
}

function defineJogador (id) {
	if (id == 'O') {
		JOGADOR_ATUAL = 'O';
		label_jogador.innerText = 'O';
		label_jogador.style.color = '#ffffff';
	}
	else {
		JOGADOR_ATUAL = 'X';
		label_jogador.innerText = 'X';
		label_jogador.style.color = '#000000';
	}
}

function trocarJogador () {
	if(JOGADOR_ATUAL == 'X') defineJogador('O')
	else defineJogador('X')
}

function blocosMatch (bloco_1, bloco_2, bloco_3) {
    if((bloco_1.innerText==bloco_2.innerText) && (bloco_2.innerText==bloco_3.innerText) && !blocoVazio(bloco_1) ) {
		bloco_1.style.backgroundColor = COR_VITORIA
		bloco_2.style.backgroundColor = COR_VITORIA
		bloco_3.style.backgroundColor = COR_VITORIA
		VENCEDOR = bloco_1.innerText;
	}
}

//Verifica se uma condição de vitória foi atingida e colore a linha da vitória
function verificaVencedor () {
	blocosMatch(blocos[0], blocos[1], blocos[2])
	blocosMatch(blocos[3], blocos[4], blocos[5])
	blocosMatch(blocos[6], blocos[7], blocos[8])
	blocosMatch(blocos[0], blocos[3], blocos[6])
	blocosMatch(blocos[1], blocos[4], blocos[7])
	blocosMatch(blocos[2], blocos[5], blocos[8])
	blocosMatch(blocos[0], blocos[4], blocos[8])
	blocosMatch(blocos[2], blocos[4], blocos[6])
}

function jogada (bloco) {
    bloco.innerText = JOGADOR_ATUAL
    bloco.style.color = COR_TEXTO_BLOCO
    verificaVencedor()
    if (!VENCEDOR) {
        trocarJogador()
    }
}

function nomeDaSala () {
    return window.location.pathname.split("/").pop()
}

const socket = io({
    query: {
        sala_id: nomeDaSala()
    }
})

socket.on(SERVER_CONNECT, () => {
    console.log(`conectado como ${socket.id}`)
    document.getElementById('sala_id').innerText = `Código da sala ${nomeDaSala()}`
})

socket.on(MSG_SIMBOLO, simbolo => {
    MEU_SIMBOLO = simbolo
    document.getElementById('meu_jogador').innerText = `Você é o jogador ${MEU_SIMBOLO}`
})

socket.on(MSG_INICIA, inicia)
socket.on(MSG_JOGADA, dados => jogada(blocos[dados.bloco]))

// Quando há desconexão com o servidor
socket.on(SERVER_DISCONNECT, () => {
    alert('Você perdeu conexão')
    window.location.href = "/"
})

// Quando o adversário perde a conexão
socket.on(MSG_DESCONEXAO, () => {
    alert('O outro jogador saiu da partida')
    window.location.href = "/"
})

for (let i = 0; i < 9; i++) {
	blocos[i].addEventListener('click', (event) => {
	    if (MEU_SIMBOLO != JOGADOR_ATUAL) return
		if ((blocoVazio(event.target)) && !VENCEDOR) {
		    socket.emit('#jogada', {
		        jogador: JOGADOR_ATUAL,
		        bloco: i
		    })
		}
	})
}

btn_reiniciar.addEventListener('click', () => socket.emit(MSG_REINICIA))