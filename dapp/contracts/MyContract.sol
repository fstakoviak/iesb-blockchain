pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract MyContract {

    // evento para notificar o cliente que a conta foi atualizada
    event userRegisted(address _addr, string newEmail);
    // evento para notificar o cliente que o produto foi registrado
    event productRegistered(uint id);
    // evento para notificar o cliente de que a Etapa foi registrada
    event StageRegistered(uint[]);
    // evento para notificar o cliente de que um histórico foi registrado
    event historyRegistered(string _msg);
    // evento para notificar o cliente de que um produto foi atualizado
    event productUpdated(uint _productId, string _msg);

    // estrutura para manter dados do usuário
    struct User {
        string email;
    }

    // estrutura para registar o estagio de um produto
    struct Stage {
        uint id;
        uint[] products;
        string desc;
        address owner;
    }

    // estrutura para manter dados do produto
    struct Product {
        uint id;
        string desc;
        uint price;
        address owner;
    }

    // estrutura para manter dados de um histórico
    struct History {
        uint productId;
        string[] stageDesc;
        string[] dates;
        address productOwner;
    }

    // mapeia um id a um produto
    mapping (uint => Product) products;
    uint[] public productsIds;

    // mapeia um id a uma etapa
    mapping(uint => Stage) stages;
    uint[] public stagesIds;

    mapping (uint => History) histories;
    uint[] public historiesIds;
    uint[] public productsInHistory;

    // mapeia endereço do usuário a sua estrutura
    mapping (address => User) users;

    // state variables
    uint256 private lastId = 0;
    uint256 private stagesId = 0;
    uint256 private historyId = 0;

    // função para cadastrar conta do usuário
    function setUser(address _addr, string memory _email) public {
        User storage user = users[_addr];
        user.email = _email;

        // notifica o cliente através do evento
        emit userRegisted(_addr, "Conta registrada!");
    }

    // função para resgatar dados do usuário
    function getUser(address _addr) public view returns(string memory) {
        User memory user = users[_addr];
        return (user.email);
    }

    // função para cadastrar um produto
    function addProduct(string memory _desc, uint _price) public {
        require(bytes(_desc).length >= 1, "Invalid name");
        require(_price > 0, "Price must be higher than zero");

        products[lastId] = Product(lastId, _desc, _price, msg.sender);
        productsIds.push(lastId);
        lastId++;
        emit productRegistered(lastId);
    }

    function updateProduct(uint _productId, string memory _newDesc, uint _newPrice) public {
        require(bytes(_newDesc).length >= 1, "Invalid name");
        require(_newPrice > 0, "New price must be higher than zero");

        Product storage prod = products[_productId];

        require(prod.owner == msg.sender, "Only the owner can update the product");
        prod.desc = _newDesc;
        prod.price = _newPrice;

        emit productUpdated(_productId, "Produto atualizado com successo");
    }

    // função para resgatar info de um produto
    function productInfo(uint _id) public view
        returns(
            uint,
            string memory,
            address,
            uint
        ) {
            require(_id <= lastId, "Product does not exist");

            Product memory product = products[_id];

            return (
                product.id,
                product.desc,
                products[_id].owner,
                product.price
            );
    }

    // função que retorna todos os produtos de um usuário
    function getProducts() public view returns(uint[] memory, string[] memory, address[] memory, uint[] memory) {

        uint[] memory ids = productsIds;

        uint[] memory idsProducts = new uint[](ids.length);
        string[] memory names = new string[](ids.length);
        address[] memory owners = new address[](ids.length);
        uint[] memory prices = new uint[](ids.length);

        for (uint i = 0; i < ids.length; i++) {
            (idsProducts[i], names[i], owners[i], prices[i]) = productInfo(i);
        }

        return (idsProducts, names, owners, prices);
    }

    function isProductInHistory(uint _id) public view returns (bool) {
        for (uint i = 0; i < productsInHistory.length; i++) {
            if (productsInHistory[i] == _id)
                return true;
        }
        return false;
    }

    // função para adicionar o histórico de um produto
    function addNewHistory(uint _productId, string[] memory _stageDesc, string[] memory _dates) public {
        require(_productId >= 0, "invalid productId");

        if (!isProductInHistory(_productId)) {
            histories[historyId] = History(_productId, _stageDesc, _dates, msg.sender);
            historiesIds.push(historyId);
            productsInHistory.push(_productId);
            historyId++;
            emit historyRegistered("History saved!");
        } else {
            bool added = addToHistory(_productId, _stageDesc, _dates);
            if (added) {
                emit historyRegistered("History saved!");
            }
        }
    }

    function addToHistory(uint _productId, string[] memory _stageDesc, string[] memory _dates) public returns (bool) {
        uint size = historiesIds.length;
        for (uint i = 0; i < size; i++) {
            if (histories[i].productId == _productId) {
                History storage his = histories[i];
                his.stageDesc.push(_stageDesc[0]);
                his.dates.push(_dates[0]);
                return true;
            }
        }
        return false;
    }

    function HistoryInfo(uint _id) public view returns (uint, string[] memory, string[] memory, address) {
        require(_id <= historyId, "History does not exist");

        History memory his = histories[_id];
        return (
            his.productId,
            his.stageDesc,
            his.dates,
            his.productOwner
        );
    }

    function getHistories() public view returns (string[] memory, string[][] memory, string[][] memory, address[] memory) {
        uint[] memory ids = historiesIds;

        uint[] memory prodsIds = new uint[](ids.length);
        string[] memory productsNames = new string[](ids.length);
        string[][] memory stageDesc = new string[][](ids.length);
        string[][] memory dates = new string[][](ids.length);
        address[] memory addrs = new address[](ids.length);

        for (uint i = 0; i < ids.length; i++) {
            (prodsIds[i], stageDesc[i], dates[i], addrs[i]) = HistoryInfo(i);
            (, productsNames[i], ,) = productInfo(prodsIds[i]);
        }

        return (productsNames, stageDesc, dates, addrs);
    }

    // função para adicionar produtos à um estágio
    function addToStage(uint[] memory _productsIds, string memory _stageDesc) public {
        require(bytes(_stageDesc).length >= 1, "Name invalid");
        require(_productsIds.length > 0, "Price must be higher than zero");

        stages[stagesId] = Stage(stagesId, _productsIds, _stageDesc, msg.sender);
        stagesIds.push(stagesId);
        stagesId++;

        emit StageRegistered(_productsIds);
    }

    // função para resgatar info de um estágio
    function stageInfo(uint _id) public view returns (uint, uint[] memory, string memory, address) {
        require(_id <= stagesId, "Product stage does not exist");

        Stage memory stage = stages[_id];
        return (stage.id, stage.products, stage.desc, stage.owner);
    }

    // função que retorna todos os produtos de um usuário
    function getStages() public view returns (uint[] memory, uint[][] memory, string[] memory, address[] memory) {

        uint[] memory ids = stagesIds;
        uint[] memory idsStages = new uint[](ids.length);
        uint[][] memory prods = new uint[][](ids.length);
        string[] memory prods_desc = new string[](ids.length);
        address[] memory owners = new address[](ids.length);

        for(uint i = 0; i < ids.length; i++) {
            (idsStages[i], prods[i], prods_desc[i], owners[i]) = stageInfo(i);
        }

        return (ids, prods, prods_desc, owners);
    }

}