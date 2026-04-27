const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const UserAchievement = sequelize.define('UserAchievement', {
    id_usuario:        { type: DataTypes.INTEGER, allowNull: false },
    id_logro:          { type: DataTypes.INTEGER, allowNull: false },
    fecha_desbloqueo:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'User_Achievements', timestamps: false });

module.exports = UserAchievement;