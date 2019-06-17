window.addEventListener('load', function() {

    console.log("*** Listing History ***");
    getHistory();
});

function getHistory() {

    $.get("/getHistory", function(res) {
        
        if (!res.error) {
            console.log(res);
            console.log("*** Views -> js -> listHistory.js -> getHistory: ***", res.msg);
            
            let histories = res.historiesArray
            console.table(histories);

            for (let i = 0; i < histories.length; i++) {
                let html = `
                    <div class="card">
                        <div class="card-header" id="heading${i}">
                            <h2 class="mb-0">
                                <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
                                    ${histories[i].stageDesc}
                                </button>
                            </h2>
                        </div>
                
                        <div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordionHistory">
                            <div class="card-body">
                                <h6> Histórico nesta etapa: </h6>
                                <table id="historyList${i}" class="table table-dark">
                                    <thead>
                                        <tr>
                                            <th scope="col">Produto</th>
                                            <th scope="col">Preço</th>
                                            <th scope="col">Owner</th>
                                            <th scope="col">Data</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;

                $("#accordionHistory").append(html);
                appendProducts(histories[i].produtos, i, histories[i].owner, histories[i].date);
            }
            
            
        } else {
            alert("Erro ao resgatar etapas do servidor. Por favor, tente novamente mais tarde. " + res.msg);
        }

    })
}

function appendProducts(produtos, historyID, owner, date) {
    for(let i = 0; i < produtos.length; i++) {
        let newRow = $("<tr>");
        let cols = "";

        cols += `<td> ${produtos[i].produto} </td>`;
        cols += `<td> ${produtos[i].preco} </td>`;
        cols += `<td> ${owner.substring(1, 10)} </td>`;
        cols += `<td> ${date} </td>`;
        
        newRow.append(cols);
        $(`#historyList${historyID}`).append(newRow);
    }
    console.log(produtos, historyID);
}