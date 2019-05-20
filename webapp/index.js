const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const Web3 = require('web3');
const axios = require('axios');
const lodash = require('lodash');

const httpEndpoint = 'http://localhost:8540';
const web3 = new Web3(httpEndpoint);
const headers = { 'Content-Type': 'application/json' }
const PORT = process.env.PORT || 3000;

const allAccountsInfoRequest = { "method": "parity_allAccountsInfo", "params": [], "id": 1, "jsonrpc": "2.0" };

const contract_abi = require("../dapp/build/contracts/MyContract.json");
const contractAdress = "0xe99789A2367F08fEB5ba9553bA54C14C63Ccb583";

const MyContract = new web3.eth.Contract(contract_abi.abi, contractAdress);

const app = express();

// set default views folder
app.set('views', __dirname + "/views");
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// registra a sessão do usuário
app.use(session({
    secret: 'mysecret',
    saveUninitialized: false,
    resave: false
}));

// rota principal
// renderiza a dashboard caso usuário esteja logado
app.get('/', function(req, res) {

    if (req.session.username) {
        res.redirect("/dashboard");
        res.end();
    } else {
        res.render('index.html');
        res.end();
    }

})

app.post('/login', async function(req, res) {
    console.log("*** LOGIN ***", req.body);

    // pega nome de usuário e senha
    let user = req.body.username;
    let pass = req.body.password;

    console.log(user, pass);
    
    let accounts = [];
        
    // envia requisão ao parity e cria um array de contas
    await axios.post(httpEndpoint, allAccountsInfoRequest, { headers })
        .then(function(response) {
            lodash.forEach(response.data.result, function (value, key) {
                accounts.push({ userName: value.name, userAddr: key })
            });
        })
        .catch(function(error) {
            return res.send({ "error": true, "msg": "Usuario nao encontrado" });
        });

    console.log(accounts);

    // filtra as contas para seleciona
    // a conta que deseja realizar o login
    let u = accounts.filter(obj => {
        return obj.userName === user;
    });

    console.log(u);

    let userAddr;

    // verifica se a conta foi encontrada
    if (u.length === 0) {
        return res.send({ "error": true, "msg": "Nome de usuario ou senha incorretos" });
    } else {
        userAddr = u[0].userAddr;
    }

    console.log(userAddr, pass);

    // se o parity desbloquear a conta 
    // então o nome de usuário e senha estão corretos
    // e o login é realizado com sucesso
    await web3.eth.personal.unlockAccount(userAddr, pass, null)
        .then(function(result) {
            console.log(result);
            console.log("Account unlocked!");
            req.session.username = user;
            req.session.password = pass;
            console.log(req.session.username);
            return res.status(200).json({ error: false, userData: { name: user, address: userAddr } })
        })
        .catch(function(error) {
            console.log("Failed to unlock account!");
            console.log(error);
            return res.send({ "error": true, "msg": "Nome de usuario ou senha incorretos" });
        })
});

// rota para renderizar a dasboard
// verifica se usuário já está logado
app.get('/dashboard', function(req, res) {

    if (req.session.username) {
        res.render('dashboard.html');
        res.end();
    } else {
        res.redirect('/');
        res.end();
    }

})

// destrói a sessão de usuário
app.get('/logout', function(req, res) {

    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } 

        res.redirect("/");
    })
})

// renderiza a página para realizar um cadastro
// caso usuário já esteja logado
// é redirecionado para a dashboard
app.get('/register', function(req, res) {
    
    if (req.session.username) {
        res.redirect('/dashboard');
        res.end();
    } else {
        res.render('register.html');
        res.end();
    }

})

// rota para registrar um usuário
// sua conta no parity é criada
app.post('/register', async function(req, res) {
    console.log("*** REGISTER ***");
    console.log(req.body);
    
    let name = req.body.username;
    let pass = req.body.password;
    let accountAddress;

    // cria requisição a ser enviada ao parity
    let newAccountRequest = { "method": "parity_newAccountFromPhrase", "params": [name, pass], "id": 1, "jsonrpc": "2.0" };

    // cria a conta no parity e salva email no contrato
    try {
        // retorna endereço do usuário
        let NewAccountResponse = await axios.post(httpEndpoint, newAccountRequest, { 'headers': headers });
        accountAddress = NewAccountResponse.data.result;
        console.log("Account created " + JSON.stringify(NewAccountResponse.data.result));

        // Registra o nome da conta de usuário no parity
        let setAccountNameRequest = { "method": "parity_setAccountName", "params": [accountAddress, name], "id": 1, "jsonrpc": "2.0" };
        let setAccountNameResponse = await axios.post(httpEndpoint, setAccountNameRequest, { 'headers': headers });
        console.log("Account name setup status: %s", JSON.stringify(setAccountNameResponse.data.result));

        //return res.status(200).json({ 'error': false, 'msg': 'Conta criada com sucesso.'});

        // Desbloqueia a conta do usuário para salvar seus dados
        // Ex: email
        let unlockResponse = await web3.eth.personal.unlockAccount(accountAddress, pass, null);
        console.log("*** Unlock response ***", unlockResponse);

        if (unlockResponse) {

            // tranfere 1 ether para a conta do usuário
            let sendFundsResponse = await web3.eth.sendTransaction({
                from: "0x00a1103c941fc2e1ef8177e6d9cc4657643f274b",
                gasPrice: "20000000000",
                gas: "21000",
                to: accountAddress,
                value: "0xDE0B6B3A7640000"
            }, "node00");

            console.log("*** sendFundsResponse ***", sendFundsResponse);

            if (sendFundsResponse) {
                MyContract.methods.setUser(accountAddress, "email@gmail.com")
                .send({ from: accountAddress, gas: 3000000 })
                .then(function(result) {
                    console.log("*** Usuário registrado ***");
                    return res.status(200).json({ 'error': false, 'msg': 'Conta criada com sucesso.'});
                })
                .catch(function (error) {
                    console.log("+++ Erro ao salvar e-mail +++");
                    console.log(error);
                    return res.send({ 'error': true, 'msg': 'Erro ao criar e-mail.'});
                })
            } else {
                return res.send({ 'error': true, 'msg': 'Erro ao transferir fundos.'});
            }

        } else {
            return res.send({ 'error': true, 'msg': 'Erro ao desbloquear a conta.'});
        }

    } catch (error) {
        console.log("Account name setup failed: %s", error);
        return res.send({ 'error': true, 'msg': error });
    }

})

app.listen(PORT, function() {
    console.log(`App listening on port ${PORT}`);
})