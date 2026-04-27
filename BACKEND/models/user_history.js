const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const UserHistory = sequelize.define('UserHistory', {
    id_historial:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_usuario:      { type: DataTypes.INTEGER, allowNull: false },
    id_pregunta:     { type: DataTypes.INTEGER, allowNull: false },
    es_correcta:     { type: DataTypes.BOOLEAN, allowNull: false },
    fecha_respuesta: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'UserHistory', timestamps: false });

module.exports = UserHistory;