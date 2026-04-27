const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const User = sequelize.define('User', {
    id_usuario:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:        { type: DataTypes.STRING, allowNull: false },
    email:       { type: DataTypes.STRING, allowNull: false, unique: true },
    password:    { type: DataTypes.STRING, allowNull: false },
    points:      { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'Users', timestamps: false });

module.exports = User;