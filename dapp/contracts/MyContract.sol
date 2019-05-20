pragma solidity ^0.5.0;

contract MyContract {

    // evento para notificar o cliente
    // de que a conta foi atualizada
    event userRegisted(address _addr, string newEmail);

    // estrutura para manter dados
    // do usuário
    struct User {
        string email;
    }

    // mapea endereço do usuário
    // a sua estrutura
    mapping (address => User) users;

    // função para cadastrar
    // a conta do usuário
    function setUser(address _addr, string memory _email) public {
        User storage user = users[_addr];
        user.email = _email;

        // notifica o cliente através do evento
        emit userRegisted(_addr, "Conta registrada!");
    }

    // função para resgatar
    // dados do usuário
    function getUser(address _addr) public view returns(string memory) {
        User memory user = users[_addr];
        return (user.email);
    }

}