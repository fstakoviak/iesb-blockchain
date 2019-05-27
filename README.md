### Dependências necessárias

Os softwares necessários para rodar o app são:

<ol>
    <li> Nodejs/npm: https://nodejs.org/en/</li>
    <li> Truffle Framework (Para fazer deploy e testes do smart contract)</li>
    <li> Curl https://curl.haxx.se/ (Para enviar requisições ao parity pelo terminal) </li>
    <li> Parity https://wiki.parity.io/Setup </li>
</ol>

Após instalar o Nodejs: <br>

    -> npm install -g truffle

### Instruções

#### Para rodar a blockchain

dentro da pasta blockchain <br>

Execute o seguinte comando: <br>

    -> parity --config nodes/node00/node.toml 

Em um outro terminal, execute os seguintes comandos: <br>

    -> curl --data '{"method":"parity_newAccountFromPhrase","params":["node00","node00"],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST localhost:8540

O comando acima retornará um endereço da conta criada, copie este endereço pois o usaremos nos próximos passos. <br>
Para que o parity reconheça a conta pelo seu nome, use o comando abaixo: <br>

    -> curl --data '{"method":"parity_setAccountName","params":["0x00a1103c941fc2e1ef8177e6d9cc4657643f274b","node00"],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST localhost:8540

Crie uma conta de usuário (não validador):

    -> curl --data '{"method":"parity_newAccountFromPhrase","params":["user","user"],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST localhost:8540
    -> curl --data '{"method":"parity_setAccountName","params":["0x004ec07d2329997267ec62b4166639513386f32e","user"],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST localhost:8540

Pare a execução do nó. Descomente o código no arquivo /nodes/node00/node.toml <br>

Execute o comando: <br>

    -> parity --config nodes/node00/node.toml --unlock 0x00a1103c941fc2e1ef8177e6d9cc4657643f274b --password node.pwds

Com a flag --unlock o nó estará sempre desbloqueado para que se consiga fazer o deploy de um smart contract <br>

#### Para fazer o deploy do contrato

Agora que a blockchain esta rodando, em um outro terminal, entre na pasta dapp. Para fazer o deploy do contrato basta executar: <br>

    -> truffle migrate --reset

Copie o endereço do contrato e cole em: <br>

webapp/index.js linha 16. Exemplo: <br>
webapp/apis/products/productsApi.js linha 10. Exemplo: <br>

    const contractAdress = "0xe99789A2367F08fEB5ba9553bA54C14C63Ccb583";

#### Para executar o app

Dentro da pasta webapp <br>

    -> npm install
    -> npm start

Para fazer login: <br>
user: user <br>
senha: user<br>
