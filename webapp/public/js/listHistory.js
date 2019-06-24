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
                                    ${histories[i].product}
                                </button>
                            </h2>
                        </div>
                
                        <div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordionHistory">
                            <div class="card-body">
                                <h6> Histórico do produto: </h6>
                                <table id="historyList${i}" class="table table-dark">
                                    <thead>
                                        <tr>
                                            <th scope="col">Etapa</th>
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
                console.log(histories[i].stage)
                appendProducts(histories[i].stage, i, histories[i].owner, histories[i].dates);
            }
            
            
        } else {
            alert("Erro ao resgatar etapas do servidor. Por favor, tente novamente mais tarde. " + res.msg);
        }

    })
}

function appendProducts(stages, historyID, owner, dates) {
    for(let i = 0; i < stages.length; i++) {
        let newRow = $("<tr>");
        let cols = "";

        cols += `<td> ${stages[i]} </td>`;
        cols += `<td> ${owner.substring(1, 10)} </td>`;
        cols += `<td> ${dates[i]} </td>`;
        
        newRow.append(cols);
        $(`#historyList${historyID}`).append(newRow);
    }
    console.log(stages, historyID);
}