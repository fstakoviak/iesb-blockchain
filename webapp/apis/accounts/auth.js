const Web3 = require("web3");
const axios = require("axios");
const lodash = require("lodash");
const path = require("path");

const allAccountsInfo = require('../../utils/parityRequests').allAccountsInfoRequest;
const httpEndpoint = require('../../utils/nodesEndPoints').node00Endpoint;
const parityRequest = require('../../utils/parityRequests');
const headers = require('../../utils/parityRequests').headers;
const contractAddress = require('../../utils/parityRequests').contractAddress;

const product_abi = require(path.resolve("../dapp/build/contracts/MyContract.json"));

const OPTIONS = {
    defaultBlock: "latest",
    transactionConfirmationBlocks: 1,
    transactionBlockTimeout: 5
};

const web3 = new Web3(httpEndpoint, null, OPTIONS);
let MyContract = new web3.eth.Contract(product_abi.abi, contractAddress);

function renderIndex(req, res) {
    if (req.session.username) {
        res.redirect("/api/auth/dashboard");
        res.end();
    } else {
        res.render('index.html');
        res.end();
    }
}

function renderRegister(req, res) {
    if (req.session.username) {
        res.redirect('/api/auth/dashboard');
        res.end();
    } else {
        res.render('register.html');
        res.end();
    }
}

function renderDashboard(req, res) {
    if (req.session.username) {
        res.render('dashboard.html');
        res.end();
    } else {
        res.redirect('/api/auth');
        res.end();
    }
}

async function register(req, res) {
    console.log("*** REGISTER ***");
    console.log(req.body);

    let name = req.body.username;
    let pass = req.body.password;
    let accountAddress;

    // cria requisição a ser enviada ao parity
    let newAccountRequest = parityRequest.newAccountRequest(name, pass);

    // cria a conta no parity e salva email no contrato
    try {
        // retorna endereço do usuário
        let NewAccountResponse = await axios.post(httpEndpoint, newAccountRequest, { 'headers': headers });
        accountAddress = NewAccountResponse.data.result;
        console.log("Account created " + JSON.stringify(NewAccountResponse.data.result));
        console.log(typeof(accountAddress));
        // Registra o nome da conta de usuário no parity
        let setAccountNameRequest = { "method": "parity_setAccountName", "params": [accountAddress, name], "id": 1, "jsonrpc": "2.0" };
        let setAccountNameResponse = await axios.post(httpEndpoint, setAccountNameRequest, { 'headers': headers });
        console.log("Account name setup status: %s", JSON.stringify(setAccountNameResponse.data.result));

        // Desbloqueia a conta do usuário para salvar seus dados
        // Ex: email
        let unlockResponse = await web3.eth.personal.unlockAccount(accountAddress, pass, null);
        console.log("*** Unlock response ***", unlockResponse);

        if (unlockResponse) {

            // tranfere 1 ether para a conta do usuário
            let sendFundsResponse = null;
            
            sendFundsResponse = await web3.eth.sendTransaction({from: "0x00a1103c941fc2e1ef8177e6d9cc4657643f274b", to: accountAddress, value: web3.utils.toWei("1", "ether")})

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
}

function logout(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } 

        res.redirect("/api/auth");
    });
}

async function login(req, res) {
    console.log("*** LOGIN ***", req.body);

    // pega nome de usuário e senha
    let user = req.body.username;
    let pass = req.body.password;
    
    // envia requisão ao parity e cria um array de contas
    let accounts = [];
    await axios.post(httpEndpoint, allAccountsInfo, { headers })
        .then(function(response) {
            lodash.forEach(response.data.result, function (value, key) {
                accounts.push({ userName: value.name, userAddr: key })
            });
        })
        .catch(function(error) {
            return res.send({ "error": true, "msg": "Usuario nao encontrado" });
        });

    // filtra as contas para selecionar
    // a conta que deseja realizar o login
    let u = accounts.filter(obj => {
        return obj.userName === user;
    });

    // verifica se a conta foi encontrada
    let userAddr;
    if (u.length === 0) {
        return res.send({ "error": true, "msg": "Nome de usuário incorreto." });
    } else {
        userAddr = u[0].userAddr;
    }

    // se o parity desbloquear a conta 
    // então o nome de usuário e senha estão corretos
    // e o login é realizado com sucesso
    await web3.eth.personal.unlockAccount(userAddr, pass, null)
        .then(function(result) {
            console.log(result);
            console.log("Account unlocked!");
            req.session.username = user;
            req.session.password = pass;
            req.session.address  = userAddr;
            console.log(req.session.username);
            return res.status(200).json({ error: false, userData: { name: user, address: userAddr } })
        })
        .catch(function(error) {
            console.log("Failed to unlock account!");
            console.log(error);
            return res.send({ "error": true, "msg": "Senha incorreta." });
        });
}

module.exports = { 
    renderIndex, 
    renderRegister, 
    renderDashboard, 
    register, 
    logout, 
    login 
};