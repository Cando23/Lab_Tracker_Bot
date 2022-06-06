const sequelize = require("./db");
const { DataTypes } = require("sequelize");
const Activity = sequelize.define("activity", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  day: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  month: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
      type: DataTypes.STRING,
      allowNull: false
  },
  amount: {
      type: DataTypes.INTEGER,
      allowNull: false
  }
});

module.exports = Activity;
