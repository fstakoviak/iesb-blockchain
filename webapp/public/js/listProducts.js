window.addEventListener("load", function() {

    // função para carregar produtos
    getProducts();
})

function getProducts() {
    console.log("*** Getting Products ***");

    $.get("/listProducts", function(res) {
        
        if (!res.error) {
            console.log("*** Views -> js -> produtos.js -> getProducts: ***", res.msg);

            if (res.msg === "no products yet") {
                return;
            }

            let produtos = res.produtos;

            // adiciona produtos na tabela
            for (let i = 0; i < produtos.length; i++) {
                let newRow = $("<tr>");
                let cols = "";
                let desc = produtos[i].produto;
                let preco = produtos[i].preco;
                let owner = produtos[i].addr;

                cols += `<td> ${desc} </td>`;
                cols += `<td> ${preco} </td>`;
                cols += `<td> ${owner.substring(1, 10)} </td>`;
                cols += `<td align="center"> 
                    <span style="font-size: 1em; color: Dodgerblue; cursor: pointer; ">
                        <a href="/editProduct?id=${produtos[i].id}"><i class="fas fa-edit"></i></a>
                    </span>
                </td>`
                
                newRow.append(cols);
                $("#products-table").append(newRow);
            }
            
        } else {
            alert("Erro ao resgatar produtos do servidor. Por favor, tente novamente mais tarde. " + res.msg);
        }

    })
}