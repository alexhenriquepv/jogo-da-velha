const COR_VITORIA = '#0F0'
const COR_BLOCO = '#F7FE2E'
const COR_TEXTO_BLOCO = '#bc5e00'
const blocos = document.querySelectorAll('.bloco')
const btn_reiniciar = document.getElementById('reiniciar')
const label_jogador = document.getElementById('jogador')

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

//Verifica se uma condição de vitória foi atingida e colore a linha da vitória
function quemVenceu () {
	if((blocos[0].innerText==blocos[1].innerText) && (blocos[1].innerText==blocos[2].innerText) && !blocoVazio(blocos[0]) ) {
		blocos[0].style.backgroundColor = COR_VITORIA
		blocos[1].style.backgroundColor = COR_VITORIA
		blocos[2].style.backgroundColor = COR_VITORIA
		return blocos[0].innerText;
	}
	else if ((blocos[3].innerText == blocos[4].innerText) && (blocos[4].innerText == blocos[5].innerText) && !blocoVazio(blocos[3]) ) {
		blocos[3].style.backgroundColor = COR_VITORIA
		blocos[4].style.backgroundColor = COR_VITORIA
		blocos[5].style.backgroundColor = COR_VITORIA
		return blocos[3].innerText;
	}
	else if ((blocos[6].innerText == blocos[7].innerText) && (blocos[7].innerText == blocos[8].innerText) && !blocoVazio(blocos[6]) ) {
		blocos[6].style.backgroundColor = COR_VITORIA
		blocos[7].style.backgroundColor = COR_VITORIA
		blocos[8].style.backgroundColor = COR_VITORIA
		return blocos[6].innerText;
	}
	else if ((blocos[0].innerText == blocos[3].innerText) && (blocos[3].innerText == blocos[6].innerText) && !blocoVazio(blocos[0]) ) {
		blocos[0].style.backgroundColor = COR_VITORIA
		blocos[3].style.backgroundColor = COR_VITORIA
		blocos[6].style.backgroundColor = COR_VITORIA
		return blocos[0].innerText;
	}
	else if ((blocos[1].innerText == blocos[4].innerText) && (blocos[4].innerText == blocos[7].innerText) && !blocoVazio(blocos[1]) ) {
		blocos[1].style.backgroundColor = COR_VITORIA
		blocos[4].style.backgroundColor = COR_VITORIA
		blocos[7].style.backgroundColor = COR_VITORIA
		return blocos[1].innerText;
	}
	else if ((blocos[2].innerText == blocos[5].innerText) && (blocos[5].innerText == blocos[8].innerText) && !blocoVazio(blocos[2]) ) {
		blocos[2].style.backgroundColor = COR_VITORIA
		blocos[5].style.backgroundColor = COR_VITORIA
		blocos[8].style.backgroundColor = COR_VITORIA
		return blocos[2].innerText;
	}
	else if ((blocos[0].innerText == blocos[4].innerText) && (blocos[4].innerText == blocos[8].innerText) && !blocoVazio(blocos[0]) ) {
		blocos[0].style.backgroundColor = COR_VITORIA
		blocos[4].style.backgroundColor = COR_VITORIA
		blocos[8].style.backgroundColor = COR_VITORIA
		return blocos[0].innerText;

	}
	else if ((blocos[2].innerText == blocos[4].innerText) && (blocos[4].innerText == blocos[6].innerText) && !blocoVazio(blocos[2]) ) {
		blocos[2].style.backgroundColor = COR_VITORIA
		blocos[4].style.backgroundColor = COR_VITORIA
		blocos[6].style.backgroundColor = COR_VITORIA
		return blocos[2].innerText;
	}
	
    return null;
}

function jogada (bloco) {
    bloco.innerText = JOGADOR_ATUAL
    bloco.style.color = COR_TEXTO_BLOCO
    trocarJogador()
    VENCEDOR = quemVenceu()
}

function nomeDaSala () {
    return window.location.pathname.split("/").pop()
}

const socket = io({
    query: {
        sala_id: nomeDaSala()
    }
})

socket.on('connect', () => {
    console.log(`conectado como ${socket.id}`)
    document.getElementById('sala_id').innerText = `Código da sala ${nomeDaSala()}`
})

socket.on('#simbolo', simbolo => {
    MEU_SIMBOLO = simbolo
    document.getElementById('meu_jogador').innerText = `Você é o jogador ${MEU_SIMBOLO}`
})

socket.on('#inicia', inicia)
socket.on('#jogada', dados => jogada(blocos[dados.bloco]))

// Quando há desconexão com o servidor
socket.on('connect_error', () => {
    alert('Você perdeu conexão')
    window.location.href = "/"
})

// Quando o adversário perde a conexão
socket.on('#desconexao', () => {
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

//			jogada(event.target)
		}
	})
}

btn_reiniciar.addEventListener('click', () => socket.emit('#reinicia'))