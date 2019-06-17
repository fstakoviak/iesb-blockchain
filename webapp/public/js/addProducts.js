window.addEventListener("load", function() {

    
    // restaga formulário de produtos
    let form = document.getElementById("addProducts");

    // adiciona uma função para
    // fazer o login quando o 
    // formulário for submetido
    form.addEventListener('submit', addProduct);
})

function addProduct() {

    // previne a página de ser recarregada
    event.preventDefault();

    $('#load').attr('disabled', 'disabled');

    // resgata os dados do formulário
    let produto = $("#produto").val();
    let preco = $("#preco").val();

    // envia a requisição para o servidor
    $.post("/addProducts", {produto: produto, preco: preco}, function(res) {
        
        console.log(res);
        // verifica resposta do servidor
        if (!res.error) {
            console.log("*** Views -> js -> produtos.js -> addProduct: ***", res.msg);            
            // limpa dados do formulário
            $("#produto").val("");
            $("#preco").val("");
            
            // remove atributo disabled do botao
            $('#load').attr('disabled', false);

            alert("Seu produto foi cadastrado com sucesso");
        } else {
            alert("Erro ao cadastrar produto. Por favor, tente novamente mais tarde. " + res.msg);
        }

    });
    
}