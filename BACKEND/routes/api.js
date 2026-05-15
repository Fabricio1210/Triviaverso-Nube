//-----------IMPORTACIONES-----------//
const express = require('express');
const path = require('path');
const routerApi = express.Router();

routerApi.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});
const {routerUsers} = require('./Users.js');
const {routerQuestions} = require('./Questions.js');
const {routerRanks} = require('./Ranks.js');
const {routerHistories} = require('./Histories.js');
const { routerCategories } = require('./Categories.js');
const {login} = require('../controllers/users_api_controller.js');

//-----------CONFIGURACIÓN DE DEPENDENCIAS-----------//
const app = express();

//-----------RUTAS EXTERNAS-----------//
routerApi.use('/users', routerUsers);
routerApi.use('/questions', routerQuestions);
routerApi.use('/rank', routerRanks);
routerApi.use('/histories', routerHistories);
routerApi.use('/categories', routerCategories);
routerApi.post('/login', login);


//-----------EXPORTACIONES-----------//
module.exports = routerApi