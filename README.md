# tracking-correios

[![Build Status](https://github.com/gabrielboliveira/tracking-correios/workflows/CI/badge.svg)](https://github.com/gabrielboliveira/tracking-correios/actions)
[![npm version](https://badge.fury.io/js/tracking-correios.svg)](https://badge.fury.io/js/tracking-correios)

Módulo para consulta do rastreio de pacotes do Correios. Acessa diretamento a API do Correios (SRO).

## Instalação

Requer `Node.js` e `npm` instalados.

```sh
$ npm install --save tracking-correios
```

Depois importe no seu código:

```js
// via require do Node.js
const TrackingCorreios = require('tracking-correios')

// ou via ES6
import TrackingCorreios from 'tracking-correios'
```

## Consulta de eventos do código de rastreio

Para consultas de um único código:

```js
// passando como string
TrackingCorreios.track( 'DU897123996BR' )
    .then(console.log)

// ou como Array
TrackingCorreios.track( [ 'DU897123996BR' ] )
    .then(console.log)

> [ {
   "numero":"DU897123996BR",
   "sigla":"DU",
   "nome":"ENCOMENDA E-SEDEX",
   "categoria":"E-SEDEX",
   "evento": [ {
         "tipo":"BDE",
         "status":"01",
         "data":"12/12/2016",
         "hora":"19:06",
         "descricao":"Objeto entregue ao destinatário",
         "recebedor":"",
         "documento":"",
         "comentario":"",
         "local":"CEE BAURU",
         "codigo":"17034972",
         "cidade":"Bauru",
         "uf":"SP"
      }, { ... }, { ... }, { ... }
   ]
} ]
```

Exemplo de código válido, porém sem rastreio

```js
TrackingCorreios.track([ 'SB231363632BR' ])
    .then(console.log)

> [ {
    numero: 'SB231363632BR',
    erro: 'Objeto não encontrado na base de dados dos Correios.'
} ]
```

Para consultas de vários códigos simultâneos:

```js
TrackingCorreios.track([ 'DU897123996BR', 'PN273603577BR', 'DU910139445BR' ])
    .then(console.log)

> [
    { numero: 'DU897123996BR',
        sigla: 'DU',
        nome: 'ENCOMENDA E-SEDEX',
        categoria: 'E-SEDEX',
        evento: [ {...}, [Object], [Object], [Object], [Object], [Object] ] },
    { numero: 'PN273603577BR',
        sigla: 'PN',
        nome: 'ENCOMENDA PAC (ETIQ LOGICA)',
        categoria: 'ENCOMENDA PAC',
        evento: [ [Object], [Object], [Object], [Object], [Object], [Object] ] },
    { numero: 'DU910139445BR',
        sigla: 'DU',
        nome: 'ENCOMENDA E-SEDEX',
        categoria: 'E-SEDEX',
        evento: [ [Object], [Object], [Object], [Object], [Object] ] }
  ]
```

O método `track` validará automaticamente os objetos, removendo os inválidos:

```js
TrackingCorreios.track([ 'DU897123996BR', 'invalido' ])
    .then(console.log)

> [ {
    "numero":"DU897123996BR",
    "sigla":"DU",
    "nome":"ENCOMENDA E-SEDEX",
    "categoria":"E-SEDEX",
    "evento": [...]
} ]
```

Se não tiver nenhum objeto válido a Promise rejeitará com `TrackingError`:

```js
TrackingCorreios.track('invalido')
    .catch(console.log)

> {
    [TrackingError: Erro ao validar os objetos.]
        name: 'TrackingError',
        message: 'Erro ao validar os objetos.',
        type: 'validation_error',
        errors:
        [ { message: 'Nenhum objeto válido para pesquisa.',
            service: 'objects_validation' } ]
  }
```

Se não quiser filtrar, use a configuração `filter`:

```js
TrackingCorreios.track('invalido', { filter: false })
    .catch(console.log)

> [ {
    numero: 'invalido',
    erro: 'Objeto não encontrado na base de dados dos Correios.'
} ]
```

O método `track` retorna uma Promise, portanto o tratamento de erros deve ser feito pelo `.catch`. Exemplo de API fora do ar:

```js
TrackingCorreios.track('DU897123996BR')
    .then(console.log)
    .catch(console.log)

> {
    [TrackingError: Erro ao se conectar ao o serviço dos Correios.]
        name: 'TrackingError',
        message: 'Erro ao se conectar com o serviço dos Correios.',
        type: 'system',
        errors:
        [ { message: 'Ocorreu um erro ao se conectar ao serviço dos Correios: request to https://webservice.correios.com.br/service/rastro failed, reason: connect ECONNREFUSED webservice.correios.com.br',
            service: 'service_error' } ]
  }
```

Pode também passar um objeto de configuração como segundo parâmetro.

```js
// Valores padrão:
TrackingCorreios.track('DU897123996BR', {
        username: "ECT",
        password: "SRO",
        filter: true,
        type: "L",
        result: "T",
        language: "101",
        limit: 5000
    })
```

Os parâmetros `username`, `password`, `type`, `result` e `language` serão enviados a API dos Correios.

O parâmetro `limit` indica a quantidade máxima de objetos a ser enviado por requisição. Se passar 8 mil objetos e o limite for 5 mil, o módulo fará duas requisições. Se passar mil objetos e o limite for 1, fará mil requisições.

O parâmetro `filter` indica se deve realizar a filtragem de pacotes válidos antes de acessar a API do Correios.

As requisições não são paralelas, serão realizadas uma após a outra. A Promise só resolverá quando todas as requisições terminarem.

#### ATENÇÃO!

O usuário padrão do sistema é `ECT`. Esse é um usuário de testes, por isso tem algumas limitações ([#15](https://github.com/gabrielboliveira/tracking-correios/issues/15), [#5](https://github.com/gabrielboliveira/tracking-correios/issues/5)). Só é possível fazer a consulta de 1 código por vez, e também só 1 evento é retornado. Para adquirir um usuário com mais permissões, é necessário ter um contrato com os Correios: http://www.correios.com.br/solucoes-empresariais/comercio-eletronico/sistema-de-rastreamento-de-objetos.

## Validação de objetos

Esse módulo expõe três métodos auxiliares para validação de objetos.

* `isValid`: verifica se o tracking é válido seguindo as regras do Correios.
* `filter`: retorna somente os objetos válidos.
* `validate`: retorna um objeto com os itens válidos e inválidos.

Exemplos:

`isValid`:

```js
TrackingCorreios.isValid('DU897123996BR')
> true

TrackingCorreios.isValid(['DU897123996BR'])
> false

TrackingCorreios.isValid('AAAAA')
> false

TrackingCorreios.isValid()
> false
```

Verifica um único objeto por vez. Valida as iniciais também com as conhecidas do correios (veja [category](#categoria-do-objeto)). Retorna um `boolean`.

------------

`filter`:

```js
TrackingCorreios.filter( 'DU897123996BR' )
> [ 'DU897123996BR' ]

TrackingCorreios.filter( [ 'DU897123996BR' ] )
> [ 'DU897123996BR' ]

TrackingCorreios.filter( [ 'DU897123996BR', 'PN273603577BR', 'DU910139445BR' ] )
> [ 'DU897123996BR', 'PN273603577BR', 'DU910139445BR' ]

TrackingCorreios.filter([ 'DU897123996BR', 'invalid' ])
> [ 'DU897123996BR' ]

TrackingCorreios.filter([ 'invalid', 'AAAA' ])
> [ ]

TrackingCorreios.filter( { } )
> [ ]
```

Sempre retornará um Array, independente se houver ou não itens válidos.

------------

`validate`:

```js
TrackingCorreios.validate( 'DU897123996BR' )
> { valid: [ 'DU897123996BR' ], invalid: [ ] }

TrackingCorreios.validate( [ 'DU897123996BR' ] )
> { valid: [ 'DU897123996BR' ], invalid: [ ] }

TrackingCorreios.validate( [ 'DU897123996BR', 'PN273603577BR', 'DU910139445BR' ] )
> {
    valid: [ 'DU897123996BR', 'PN273603577BR', 'DU910139445BR' ],
    invalid: [ ]
  }

TrackingCorreios.validate([ 'DU897123996BR', 'invalid' ])
> {
    valid: [ 'DU897123996BR' ],
    invalid: [ 'invalid' ]
  }

TrackingCorreios.validate([ 'invalid', 'AAAA' ])
> {
    valid: [ ],
    invalid: [ 'invalid', 'AAAA' ]
  }

TrackingCorreios.validate( { } )
> {
    valid: [ ],
    invalid: [ { } ]
  }
```

Sempre retornará um objeto com os campos `valid` e `invalid`.

## Categoria do Objeto

O módulo expõe um método para retornar a categoria do objeto: `category`. Exemplo:

```js
TrackingCorreios.category('DU897123996BR')
> 'e-SEDEX'

TrackingCorreios.category(['PN273603577BR'])
> 'PAC'

TrackingCorreios.category(['AA123123123BR'])
> undefined

TrackingCorreios.category('AAAAA')
> undefined

TrackingCorreios.category()
> undefined
```

Se não for um código de rastreio válido, retornará `undefined`.

# Inspiração

Arquitetura inspirada no módulo [cep-promise](https://github.com/filipedeschamps/cep-promise) de Filipe Deschamps. Queria aprender mais sobre encadeamento de Promises, funções pequenas e vários outros assuntos que ele aborda [nesse vídeo](https://www.youtube.com/watch?v=gB5Gej0O400), por isso decidi desenvolver esse módulo.
