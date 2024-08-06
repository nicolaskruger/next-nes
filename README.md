# Next NES :space_invader:

Esse é o meu projeto de conclusão do curso de engenharia da computação pela `Unisinos`, é um emulador de nintendo que roda nos navegadores.

## tecnologias :wrench:

- [React.js](https://react.dev/)
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
- [Jest](https://jestjs.io/pt-BR/)

## requisitos

- [node](https://nodejs.org/pt)

## começando

Para inicializar o projeto basta rodar um dos seguintes comandos

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

e abrir o navegador no [http://localhost:3000](http://localhost:3000)
escolher uma `rom` existe duas roms de teste no `/games/demo.nes` e `/games/unisinos.nes` após abrir as rom ele vai começar a carregar os tiles, isso deixa o jogo lento
mas após o carregamento completo o jogo rodas em `60 fps`

## Features

- :white_check_mark: todos os opcodes legais
- :white_check_mark: todos os espelhamentos de memória
- :white_check_mark: NROM, no mapper
- :white_check_mark: cpu
- :white_check_mark: ppu
- :white_check_mark: espelhamento vertical ppu
- :white_check_mark: espelhamento horizontal ppu
- :white_check_mark: tela única ppu
- :white_check_mark: 4 telas ppu
- :white_check_mark: decompiler
- :white_check_mark: compilador
- :white_check_mark: NMI
- :white_check_mark: registradores de controle ppu
- :white_check_mark: scroll
- :white_check_mark: 60 fps
- :white_check_mark: pad 1
- :white_check_mark: espelhamento de sprite vertical
- :white_square_button: pad 2
- :white_square_button: opcodes ilegais
- :white_square_button: espelhamento de sprite horizontal
- :white_square_button: sprite atrás do background

## comando para gerar roms

```bash
cl65 --verbose --target nes -o demo.nes demo.s

cl65 --verbose --target nes -o unisinos.nes unisinos.s
```
