const express = require('express');
const { getAllCategories } = require('../controllers/categories_api_controller');
const routerCategories = express.Router();

routerCategories.get('/', getAllCategories);

module.exports = { routerCategories };