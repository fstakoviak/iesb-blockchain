const path = require('path');
const Web3 = require("web3");
const axios = require("axios");
const lodash = require("lodash");
const atob = require("atob");

const product_abi = require(path.resolve("../dapp/build/contracts/MyContract.json"));
const httpEndpoint = 'http://localhost:8540';

let contractAddress = '0x47443d09E8afee727d30dc8c23Bc3406519Df015';

let web3 = new Web3(httpEndpoint);
let MyContract = new web3.eth.Contract(product_abi.abi, contractAddress);

module.exports = {
    getRegister: function(req, res) {
        if (req.session.username) {
            res.redirect('/dashboard');
            res.end();
        } else {
            res.render('register.html');
            res.end();
        }
    }
}