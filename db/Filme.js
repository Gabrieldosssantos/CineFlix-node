const { DataTypes } = require("sequelize");
const db = require("./conn");

const Filme = db.define("Filme", {
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  diretor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  genero: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dataLancamento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  imagem: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  trailer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Filme;
