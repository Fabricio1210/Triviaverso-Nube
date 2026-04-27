const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Achievement = sequelize.define('Achievement', {
    id_logro:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre:     { type: DataTypes.STRING, allowNull: false },
    condicion:  { type: DataTypes.STRING, allowNull: false },
    icono_url:  { type: DataTypes.STRING }
}, { tableName: 'Achievements', timestamps: false });

module.exports = Achievement;