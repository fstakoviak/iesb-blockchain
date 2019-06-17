// mantem etapas em memoria para verificar
// se ha um determinado produto nela
var stages;

// dados para registrar o historico
var dataToServer = {}

window.addEventListener('load', function() {
    console.log("hello from addToHistory");

    // carrega produtos e etapas para os selects
    addToSelect();

    // resgata formulário select
    let form = document.getElementById("addToSelect");

    form.addEventListener('submit', compare);
});

// adicionar produtos e etapas ao select
function addToSelect() {

    // resgata produtos e adiciona no select
    $.get("/listProducts", function(res) {
        if (!res.error) {
            console.log("*** Public -> js -> addToHistory -> addToSelect: ***");
            if (res.msg === "no products yet") {
                return;
            }

            let produtos = res.produtos;
            
            produtos.forEach(function(produto) {
                $('select#productSelect').append($('<option>', {
                    value: produto.id,
                    text: produto.produto
                }));
            });
        } else {
            alert("Erro ao resgatar etapas do servidor. Por favor, tente novamente mais tarde. " + res.msg);
        }
        
    }); 

    // resgata etapas e adiciona no select
    $.get("/listStages", function(res) {
        if (!res.error) {
            console.log("*** Public -> js -> addToHistory.js -> addToSelect: ***", res.msg);

            stages = res.stages;
            console.table(stages);
            
            stages.forEach(function(stage) {
                $('select#stageSelect').append($('<option>', {
                    value: stage.stageID,
                    text: stage.stageDesc
                }));
            });
            
        } else {
            alert("Erro ao resgatar etapas do servidor. Por favor, tente novamente mais tarde. " + res.msg);
        }
    })


}

// resgata e cria dados para enviar ao servidor
// compara se o produto percente a uma etapa
function compare(event) {

    console.log("*** Public -> js -> addToHistory -> compare: ***");
    
    // previne recarregamento de pagina
    event.preventDefault();

    $('#load').attr('disabled', 'disabled');

    // resgata dados do formulário
    let produto = $("#productSelect option:selected").val();
    let etapa = $("#stageSelect option:selected").val();
    console.log("etapa: ", etapa);
    console.log("produto: ", produto);

    let isPIS = isProductInStage(parseInt(produto, 10), etapa);
    
    // Se o produto estiver cadastrado na etapa escolhida
    // entao uma requisao ao servidor e enviada
    // para registrar no historico
    if (isPIS) {
        console.log("*** registrando histórico... ***");
        
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        const hours = date.getHours();
        const min = date.getMinutes();
        const sec = date.getSeconds();

        const dateString = `${day}/${month+1}/${year} - ${hours}:${min}:${sec}`;

        dataToServer.date = dateString;
        
        console.log(dataToServer);
        addToHistory(dataToServer);
    } else {
        alert("Este produto não está registrado nesta etapa");
        $('#load').attr('disabled', false);
    }
}

// verifica se produto percente a uma etapa
// retorna true ou false
function isProductInStage(productId, stageId) {

    let products; 
    
    for (let i = 0; i < stages.length; i++) {
        if (stages[i].stageID == stageId) {
            console.log(stages[i].produtos);
            products = stages[i].produtos;
            dataToServer.stage = stages[i].stageDesc;
        }
    }

    if (products) {
        for (let j = 0; j < products.length; j++) {
            if (products[j].productID == productId) {
                console.log(products[j])
                dataToServer.productId = products[j].productID;
                return true;
            }
        }

        return false;
    }
}

// envia dados ao servidor 
// para registrar um historico
function addToHistory(data) {
    $.post("/addHistory", data, function(res) {
        if (!res.error) {
            $('#load').attr('disabled', false);
            alert(res.msg);
        } else {
            $('#load').attr('disabled', false);
            alert(res.msg);
        }
        
    })
}