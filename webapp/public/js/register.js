window.addEventListener("load", function() {
    
    // restaga formulário de login
    let form = document.getElementById("registerForm");

    // adiciona uma função para
    // fazer o login quando o 
    // formulário for submetido
    form.addEventListener('submit', register);
})

function register(event) {

    // previne a página de ser recarregada
    event.preventDefault();

    $('#load').attr('disabled', 'disabled');

    // resgata os dados do formulário
    let username = $("#username").val();
    let password = $("#password").val();

    // envia a requisição para o servidor
    $.post("/api/auth/register", {username: username, password: password}, function(res) {
        console.log(res);
        // verifica resposta do servidor
        // redireciona para tela de login
        // caso a conta seja criada com sucesso
        if (!res.error) {
            window.location.href="/";
            alert(res.msg);
        } else {
            alert("Erro ao criar sua conta. Por favor, tente novamente mais tarde. " + res.msg);
        }

    })
}