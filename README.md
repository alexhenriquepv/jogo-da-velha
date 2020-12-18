# Jogo da Velha
UFAM - Redes de computadores ERE 2020.

![github-small](https://github.com/alexhenriquepv/jogo-da-velha/blob/main/public/print.png)

## Arquitetura e comunicação
A aplicação conta com um servidor que recebe as requisições, realiza o processamento e devolve a resposta. Dessa forma, arquitetura __Cliente e Servidor__.
Além disso, todas as comunicações são realizadas sob o protocolo TCP.

## Validação
A aplicação verifica a origem do pacote, aceitando somente conexões provenientes do próprio servidor.

## Tecnologias
- Nodejs v12;
- ExpressJs;
- Socket.io;
- Vue.js;

## Tratamento de exceção
Caso ocorra falha no servidor, abandono de sessão, ou perda de conexão por um componente, a aplicação cliente redireciona à página inicial.

## Padrão de mensagens
Todas as mensagens são enviadas por websockets, e seus respectivos códigos devem ter o prefixo __#__.

## Regras do jogo
- Uma sala comporta as jogadas de no máximo 2 jogadores;
- Um jogador pode participar de várias partidas ao mesmo tempo;
- O jogador que cria a sala recebe o símbolo __X__, e seu oponente o __O__;
- O jogador __O__ sempre inicia a partida;

## Máquina de estado
![github-small](https://github.com/alexhenriquepv/jogo-da-velha/blob/main/public/stm.png)

## Inicialização
```npm install && npm start```
