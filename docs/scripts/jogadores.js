Vue.component('jogadores', {
  props: ["data"],
  data: () => {
    return {
      jogadores: this.data
    }
  },
  methods: {
    convidaJogador: function (convidado) {
      bus.$emit('convida-jogador', convidado)
    }
  },
  mounted () {
    bus.$on("list:jogadores", (jogadores) => this.jogadores = jogadores)
  },
  template: `
  <ul class="menu">
    <li class="divider" data-content="Jogadores Online"></li>
    <li class="menu-item" v-for="j in jogadores" :key="j.id">
      <a v-on:click="convidaJogador(j)">{{ j.nome }}</a>
    </li>
  </ul>
  `
})
