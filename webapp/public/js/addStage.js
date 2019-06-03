window.addEventListener("load", function() {

    // restaga formulário de cadastro de etapas
    let form = document.getElementById("addStage");

    // adiciona uma função para
    // enviar dados ao servidor quando 
    // formulário for submetido
    form.addEventListener('submit', addStage);

    getProducts();
})

function addStage(event) {
    event.preventDefault();
    event.preventDefault();
    console.log("*** Adding to Stage ***");

    // bloqueia botão
    $('#load').attr('disabled', 'disabled');

    // pega o valor dos checkboxes selecionados
    // e adiciona no array productsIds
    let productsIds = [];
    $.each($("input[name='produto']:checked"), function() {
        let id = $(this).val();
        productsIds.push(parseInt(id, 10));
    });

    // verifica se há checkboxes selecionados
    if (productsIds.length === 0) {
        alert("Nenhum produto selecionado");
        $('#load').attr('disabled', false);
        return;
    }

    // resgata a descrição da etapa
    let StageDesc = $("#desc").val();

    // reset os checkboxes
    $('input[type=checkbox]').prop('checked', false);
    console.log(productsIds, StageDesc);

    // dados para enviar ao servidor
    const data = { productsIds, StageDesc }

    $.post("/addStage", data, function(res) {
        console.log(res);
        if (!res.error) {
            alert(res.msg);
            $("#desc").val("");
            $('#load').attr('disabled', false);
        } else {
            alert(res.msg);
            $('#load').attr('disabled', false);
        }
    })

}

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