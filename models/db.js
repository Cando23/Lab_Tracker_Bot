const {Sequelize} = require("sequelize");
module.exports = new Sequelize(
    'LabTrackerBot',
    'postgres',
    'admin',
    {
        host: "localhost",
        dialect: "postgres",
        storage: './'
    }
)