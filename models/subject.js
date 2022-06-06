const sequelize = require("./db");
const { DataTypes } = require("sequelize");
const Subject = sequelize.define("subject", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  acronym: { type: DataTypes.STRING, allowNull: false, unique: true },
});

module.exports = Subject;
