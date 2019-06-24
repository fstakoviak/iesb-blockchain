let productId, productName, productPrice;

window.addEventListener('load', () => {
    console.log("*** editing product page loaded ");

    let url_string = window.location.href;
    let url = new URL(url_string);
    productId = parseInt(url.searchParams.get("id"), 10);
    console.log("Product ID: ", productId);

    // restaga formulário de produtos
    let form = document.getElementById("editProduct");

    // adiciona uma função para
    // fazer o login quando o 
    // formulário for submetido
    form.addEventListener('submit', updateProduct);
});

function updateProduct(event) {
    event.preventDefault();
    console.log("*** Editing product: ", productId);

    $('#load').attr('disabled', 'disabled');

    // resgata os dados do formulário
    let newDesc = $("#produto").val();
    let newPrice = $("#preco").val();

    // envia a requisição para o servidor
    $.post("/updateProduct", {productId, newDesc, newPrice}, function(res) {
    
        console.log(res);
        // verifica resposta do servidor
        if (!res.error) {
            console.log("*** Views -> js -> produtos.js -> addProduct: ***", res.msg);            
            // limpa dados do formulário
            $("#produto").val("");
            $("#preco").val("");
            
            // remove atributo disabled do botao
            $('#load').attr('disabled', false);

            alert("Seu produto foi atualizado com sucesso");
            window.location.href = "/getProducts";
        } else {
            alert("Erro ao atualizar produto. Por favor, tente novamente mais tarde. " + res.msg);
        }

    });
}