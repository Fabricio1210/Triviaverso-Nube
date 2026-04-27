const sequelize      = require('../database/connection');
const User           = require('./user');
const Question       = require('./question');
const UserHistory    = require('./user_history');
const Category       = require('./category');
const Achievement    = require('./achievement');
const UserAchievement= require('./user_achievement');

Category.hasMany(Question,   { foreignKey: 'id_categoria' });
Question.belongsTo(Category, { foreignKey: 'id_categoria' });

User.hasMany(UserHistory,    { foreignKey: 'id_usuario' });
UserHistory.belongsTo(User,  { foreignKey: 'id_usuario' });

Question.hasMany(UserHistory,    { foreignKey: 'id_pregunta' });
UserHistory.belongsTo(Question,  { foreignKey: 'id_pregunta' });

User.belongsToMany(Achievement, {
    through: UserAchievement,
    foreignKey: 'id_usuario',
    otherKey: 'id_logro'
});
Achievement.belongsToMany(User, {
    through: UserAchievement,
    foreignKey: 'id_logro',
    otherKey: 'id_usuario'
});

module.exports = { sequelize, User, Question, UserHistory, Category, Achievement, UserAchievement };