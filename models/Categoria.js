const Sequelize = require('sequelize')
const db = require('./../db/conn')
const Categoria = db.define('categoria', {
    nome: {
        type: Sequelize.STRING
    }
})
module.exports = sequelize
