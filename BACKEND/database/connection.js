require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mariadb',
        port: process.env.DB_PORT || 3306,
        logging: false,
        dialect: 'mariadb',
        port: process.env.DB_PORT || 3306,
        logging: false,
        dialectOptions: {
        ssl: {
            ca: fs.readFileSync(path.join(__dirname, '../certs/global-bundle.pem')),
            rejectUnauthorized: true
            }
        },
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    }
);

module.exports = sequelize;