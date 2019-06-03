const path = require('path');
const Web3 = require("web3");

const product_abi = require(path.resolve("../dapp/build/contracts/MyContract.json"));
const httpEndpoint = 'http://localhost:8540';

let contractAddress = '0xe99789A2367F08fEB5ba9553bA54C14C63Ccb583';

const OPTIONS = {
    defaultBlock: "latest",
    transactionConfirmationBlocks: 1,
    transactionBlockTimeout: 5
};

let web3 = new Web3(httpEndpoint, null, OPTIONS);

let MyContract = new web3.eth.Contract(product_abi.abi, contractAddress);

module.exports = {
    renderAddProducts: function(req, res) {

        // verifica se usuario esta logado
        if (!req.session.username) {
            res.redirect('/api/auth');
            res.end();
        } else {
            res.render('produtos.html');
        }
    },
    renderGetProducts: function(req, res) {
        // verifica se usuario esta logado
        if (!req.session.username) {
            res.redirect('/api/auth');
            res.end();
        } else {
            res.render('listaProdutos.html');
        }
    },
    getProducts: async function(req, res) {

        let userAddr = req.session.address;
        console.log("*** Getting products ***", userAddr);

        await MyContract.methods.getProducts(userAddr)
            .call({ from: userAddr, gas: 3000000 })
            .then(function (prod) {

                console.log("prod", prod);
                if (prod === null) {
                    return res.send({ error: false, msg: "no products yet"});
                }

                let produtos = [];
                for (i = 0; i < prod['0'].length; i++) {
                    // deleted products have id == 0
                    // return only ids > 0
                    if (!(+prod['0'][i] == 0)) {
                        produtos.push({ 'id': +prod['0'][i], 'produto': prod['1'][i], 'addr': prod['2'][i], 'preco': +prod['3'][i] });
                    }
                }

                console.log("produtos", produtos);

                res.send({ error: false, msg: "produtos resgatados com sucesso", produtos});
                return true;
            })
            .catch(error => {
                console.log("*** productsApi -> getProducts ***error:", error);
                res.send({ error: true, msg: error});
            })
        
    },
    addProducts: async function(req, res) {

        if (!req.session.username) {
            res.redirect('/');
            res.end();
        } else {
            console.log("*** ProductsApi -> AddProducts ***");
            console.log(req.body);

            let produto = req.body.produto;
            let preco   = req.body.preco;
            let userAddr = req.session.address;
            let pass     = req.session.password;

            try {
                let accountUnlocked = await web3.eth.personal.unlockAccount(userAddr, pass, null)
                if (accountUnlocked) {

                    await MyContract.methods.addProduct(produto, preco)
                        .send({ from: userAddr, gas: 3000000 })
                        .then(function(result) {
                            console.log(result);
                            return res.send({ 'error': false, 'msg': 'Produto cadastrado com sucesso.'});  
                        })
                        .catch(function(err) {
                            console.log(err);
                            return res.send({ 'error': true, 'msg': 'Erro ao comunicar com o contrato.'});
                        })
                } 
            } catch (err) {
                return res.send({ 'error': true, 'msg': 'Erro ao desbloquear sua conta. Por favor, tente novamente mais tarde.'});
            }
        }
    }
}