const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Category = sequelize.define('Category', {
    id_categoria: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre:       { type: DataTypes.STRING, allowNull: false },
    descripcion:  { type: DataTypes.TEXT }
}, { tableName: 'Categories', timestamps: false });

module.exports = Category;