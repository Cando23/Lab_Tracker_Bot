const sequelize = require("./db");
const { DataTypes } = require("sequelize");
const Lab = sequelize.define("lab", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  current: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Lab;
