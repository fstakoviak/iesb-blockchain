const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

const products = require("./apis/products/products.js");
const stages = require("./apis/products/stages");
const history = require("./apis/products/history.js");

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

const authRoutes = require('./apis/routes/auth.js');

app.get('/', (req, res) => {
    res.redirect('/api/auth');
});

// * Auth pages * //
app.use("/api/auth", authRoutes);

// * Products pages * //
app.get("/addProducts", products.renderAddProducts);
app.get("/getProducts", products.renderGetProducts);
app.get("/editProduct", products.renderEditProduct);

app.post("/addProducts", products.addProducts);
app.post("/updateProduct", products.updateProduct);
app.get("/listProducts", products.getProducts);

// * Estágios * //
app.get("/addStage", stages.renderAddStage);
app.get("/getStages", stages.renderGetStages);

app.post("/addStage", stages.addStage);
app.get("/listStages", stages.listStages);

// * History * //
app.get("/addHistory", history.renderAddHistory);
app.post("/addHistory", history.addHistory);

app.get("/getHistory", history.getHistory);
app.get("/listHistory", history.renderGetHistory);

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log(`App listening on port ${PORT}`);
})