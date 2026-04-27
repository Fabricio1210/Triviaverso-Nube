const express = require('express');
const {
    getAllQuestions,
    getQuestionByID,
    saveNewQuestion,
    updateQuestion,
    deleteQuestion
} = require('../controllers/questions_api_controller');

const routerQuestions = express.Router();

routerQuestions.get('/', getAllQuestions);
routerQuestions.get('/byID/:id', getQuestionByID);
routerQuestions.post('/', saveNewQuestion);
routerQuestions.put('/:id', updateQuestion);
routerQuestions.delete('/:id', deleteQuestion);

module.exports = { routerQuestions };