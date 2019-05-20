window.addEventListener("load", function() {

    // restaga formulario de login
    let form = document.getElementById("loginForm");

    // adiciona uma função para
    // fazer o login quando o 
    // formulário for submetido
    form.addEventListener('submit', login);
})

function login(event) {

    // previne a página de ser recarregada
    event.preventDefault();

    // resgata os dados do formulário
    let username = $("#username").val();
    let password = $("#password").val();

    // envia a requisição para o servidor
    $.post("/login", {username: username, password: password}, function(res) {
        
        // verifica resposta do servidor
        // redireciona para tela de login
        // caso a conta seja criada com sucesso
        if (!res.error) {
            window.location.href="/dashboard";
        } else {
            console.log(res.msg);
            alert("Erro ao fazer login sua conta. " + res.msg);
        }

    })
}