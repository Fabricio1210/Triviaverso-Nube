const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Question = sequelize.define('Question', {
    id_pregunta:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_categoria:       { type: DataTypes.INTEGER, allowNull: false },
    question:           { type: DataTypes.TEXT, allowNull: false },
    option_0:           { type: DataTypes.STRING },
    option_1:           { type: DataTypes.STRING },
    option_2:           { type: DataTypes.STRING },
    option_3:           { type: DataTypes.STRING },
    right_answer_index: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'Questions', timestamps: false });

module.exports = Question;