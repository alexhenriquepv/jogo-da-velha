Vue.component('tabuleiro', {
    props: ["solicitante", "convidado", "id_sala"],
    data: () => {
        return {
			finalizado: false,
			na_vez: '',
			blocos: [
				{ text: "" },{ text: "" },{ text: "" },
				{ text: "" },{ text: "" },{ text: "" },
				{ text: "" },{ text: "" },{ text: "" },
			]
		}
    },
    methods: {
        resizeBlocks () {
            const blocos = document.getElementsByClassName('bloco-content')
            for (let b of blocos) {
                b.style.height = b.clientWidth + "px"
                b.style.lineHeight = b.clientWidth + "px"
            }
        },
        jogada (id_bloco) {
			// valida se o jogador está na vez
			if (
				(this.solicitante.atual && this.solicitante.simbolo == this.na_vez) ||
				(this.convidado.atual && this.convidado.simbolo == this.na_vez)
			) {
				// valida se já houve jogada no bloco
				if (!this.finalizado && !this.blocos[id_bloco].text) {
					socket.emit(MSG_JOGADA, {
						id_sala: this.id_sala,
						id_bloco: id_bloco
					})
				}
			}
        },
		mudaJogador () {
			if (!this.na_vez || (this.na_vez == JOGADOR_X)) {
				this.na_vez = JOGADOR_O
			}
			else this.na_vez = JOGADOR_X
		},
		verificaVencedor () {
			this.blocosMatch(this.blocos[0], this.blocos[1], this.blocos[2])
			this.blocosMatch(this.blocos[3], this.blocos[4], this.blocos[5])
			this.blocosMatch(this.blocos[6], this.blocos[7], this.blocos[8])
			this.blocosMatch(this.blocos[0], this.blocos[3], this.blocos[6])
			this.blocosMatch(this.blocos[1], this.blocos[4], this.blocos[7])
			this.blocosMatch(this.blocos[2], this.blocos[5], this.blocos[8])
			this.blocosMatch(this.blocos[0], this.blocos[4], this.blocos[8])
			this.blocosMatch(this.blocos[2], this.blocos[4], this.blocos[6])
		},
		blocosMatch (bloco_1, bloco_2, bloco_3) {
		    if(bloco_1.text && (bloco_1.text == bloco_2.text) && (bloco_2.text == bloco_3.text)) {
				bloco_1.matched = true
				bloco_2.matched = true
				bloco_3.matched = true
				this.finalizado = true
			}
		},
		sair () {
			socket.emit(MSG_SAIR_PARTIDA, this.id_sala)
			bus.$emit("jogador-saiu", this.id_sala)
		}
    },
    mounted () {
        this.resizeBlocks()
        window.addEventListener("resize", this.resizeBlocks)

		bus.$on("jogada", (data) => {
			if (this.id_sala == data.id_sala) {
				this.blocos[data.id_bloco].text = this.na_vez
				this.verificaVencedor()
				if (!this.finalizado) this.mudaJogador()
			}
		})

		bus.$on("inicia", (id_sala) => {
			if (this.id_sala == id_sala) {
				this.mudaJogador()
			}
		})
    },
    template: `
    <div class="tabuleiro">
      <div class="card">
        <div class="card-header">
          <div class="card-title h5">
		  	<span class="label" v-bind:class="{
				'label-success': solicitante.atual,
				'label-error': !solicitante.atual }">
				{{ solicitante.nome }} {{ solicitante.simbolo }}
			</span> vs
			<span class="label" v-bind:class="{
				'label-success': convidado.atual,
				'label-error': !convidado.atual }">
				{{ convidado.nome }} {{ convidado.simbolo }}
			</span>
		  </div>
          <div class="card-subtitle text-gray">
		  	<span v-bind:class="{
				'text-success': (solicitante.atual && (solicitante.simbolo == na_vez)) ||
					(convidado.atual && (convidado.simbolo == na_vez))
			}">
			Na vez: {{ na_vez }}</span>
		  </div>
        </div>
        <div class="card-body">
          <div class="info">
            <p>Sala: <b>{{ id_sala }}</b></p>
          </div>
          <div class="blocos columns">
            <div class="column bloco col-4 text-center" v-for="(b, index) in blocos">
				<div
					class="bg-dark bloco-content"
					v-bind:class="{ 'bg-error' : b.matched }"
					v-on:click="jogada(index)">{{ b.text }}</div>
			</div>
          </div>
        </div>
        <div class="card-footer">
          <button v-on:click="sair"
		  class="btn btn-primary">Sair</button>
        </div>
      </div>
    </div>
  `
})
