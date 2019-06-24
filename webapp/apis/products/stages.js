const path = require('path');
const Web3 = require('web3');

const product_abi = require(path.resolve("../dapp/build/contracts/MyContract.json"));
const httpEndpoint = 'http://localhost:8540';

let contractAddress = require('../../utils/parityRequests').contractAddress;

const OPTIONS = {
    defaultBlock: "latest",
    transactionConfirmationBlocks: 1,
    transactionBlockTimeout: 5
};

let web3 = new Web3(httpEndpoint, null, OPTIONS);
let MyContract = new web3.eth.Contract(product_abi.abi, contractAddress);

function renderAddStage(req, res) {

    // verifica se usuario esta logado
    if (!req.session.username) {
        res.redirect('/api/auth');
        res.end();
    } else {
        res.render('stages.html');
    }
}

function renderGetStages(req, res) {
    // verifica se usuário esta logado
    if (!req.session.username) {
        res.redirect('/api/auth');
        res.end();
    } else {
        res.render('listaEtapas.html');
    }
}

async function addStage(req, res) {
    
    console.log("*** products -> productsApi -> addProductToStage ***");
    console.dir(req.body);

    let productsIds = [];
    let stageDesc = req.body.StageDesc;
    let userAddr = req.session.address;
    let pass = req.session.password;

    // converter ids dos produtos para inteiro
    for (let i = 0; i < req.body.productsIds.length; i++) {
        let productId = parseInt(req.body.productsIds[i], 10);
        productsIds.push(productId);
    }

    console.log(userAddr, productsIds, stageDesc);
    
    // unlock account
    await web3.eth.personal.unlockAccount(userAddr, pass, null)
        .then(async result => {
            console.log("Conta desbloqueada: ", result);
            // salvar etapa no contrato
            await MyContract.methods.addToStage(productsIds, stageDesc)
                .send({ from: userAddr, gas: 3000000 })
                .then(response => {
                    console.log("etapa registrada com sucesso");
                    console.log(response);
                    res.send({ error: false, msg: "Etapa registrada com sucesso"});        
                })
                .catch(err => {
                    console.log("*** ERROR: products -> productsApi -> addProductToStage ***");
                    console.log(err);
                    res.send({ error: true, msg: "Erro ao registrar etapa. Por favor, tente novamente mais tarde."});
                })
        })
        .catch(err => {
            console.log("*** ERROR: products -> productsApi -> addProductToStage ***");
            console.log(err);
            res.send({ error: true, msg: "Erro ao desbloquear a conta. Por favor, tente novamente mais tarde."});
        })

}

async function listStages(req, res) {
    console.log("*** apis -> products -> stages -> listStages ***");

    let userAddr = req.session.address;
    console.log(userAddr);
    
    await MyContract.methods.getStages()
        .call({ from: userAddr, gas: 3000000 })
        .then(async function(stages) {
            if (stages === null) {
                return res.send({ error: false, msg: "no stages yet"});
            }

            let stagesArray = [];
            for (let i = 0; i < stages['0'].length; i++) {
                let stageObj = {}

                stageObj.stageID = +stages['0'][i];
                stageObj.stageDesc = stages['2'][i];

                let productsIDs = stages['1'][i];
                let produtos = await productInfo(productsIDs, userAddr);

                stageObj.produtos = produtos;
                stagesArray.push(stageObj);
            }
            console.log(stagesArray);
            res.send({error: false, stages: stagesArray});
        })
        .catch(error => {
            console.log("*** ERROR: api -> products -> stages -> listStages -> catch ***", error);
            res.send({error: true, msg: error})
        })
}

async function productInfo(productsIds, userAddr) {
    let produtos = [];

    for (let i = 0; i < productsIds.length; i++) {
        
        let productID = +productsIds[i];
        await MyContract.methods.productInfo(productID)
            .call({ from: userAddr, gas: 3000000 })
            .then(res => {
                let productObj = {}
                productObj.productID = +res['0'];
                productObj.produto   = res['1'];
                productObj.preco     = +res['3'];
                produtos.push(productObj);
            })
            .catch(err => {
                console.log("*** ERROR: api -> products -> stages -> productInfo -> catch ***", error);
                return null;
            });
    }

    return produtos;
}

module.exports = {
    renderAddStage,
    renderGetStages,
    addStage,
    listStages,
    productInfo
}