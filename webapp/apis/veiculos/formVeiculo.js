const path = require('path');

module.exports = {
    renderAddVeiculo: function(req, res) {
        // verifica se usuario esta logado
        if (!req.session.username) {
            res.redirect('/api/auth');
            res.end();
        } else {
            res.render('formVeiculo.html');
        }
    }
}