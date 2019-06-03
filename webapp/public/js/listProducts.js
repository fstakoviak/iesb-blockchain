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

                cols += `<td width="60"> 
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="produto" value="${produtos[i].id}" id="addToStageCheck">
                    </div>
                </td>`;
                cols += `<td> ${produtos[i].produto} </td>`;
                cols += `<td> ${produtos[i].preco} </td>`;
                
                newRow.append(cols);
                $("#products-table").append(newRow);
            }
            
        } else {
            alert("Erro ao resgatar produtos do servidor. Por favor, tente novamente mais tarde. " + res.msg);
        }

    })
}