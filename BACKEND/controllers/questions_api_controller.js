const { Question, Category } = require('../models');

// GET /questions/:id
function getQuestionByID(req, res) {
    Question.findByPk(req.params.id, {
        include: [{ model: Category }]
    })
    .then((question) => {
        if (question)
            res.status(200).send(question);
        else
            res.status(404).send({ Error: 'Question not found.' });
        })
    .catch((err) => res.status(500).send({ Error: err.message }));
}

// GET /questions
function getAllQuestions(req, res) {
    const where = req.query.id_categoria
        ? { id_categoria: req.query.id_categoria }
        : {};

    Question.findAll({ where, include: [{ model: Category }] })
        .then((questions) => res.status(200).send(questions))
        .catch((err) => res.status(500).send({ Error: err.message }));
}

// POST /questions
function saveNewQuestion(req, res) {
    const {
        id_categoria,
        question,
        option_0, option_1, option_2, option_3,
        right_answer_index
    } = req.body;

    if (!id_categoria || !question || !option_0 || !option_1 ||
        !option_2 || !option_3 || right_answer_index === undefined)
    return res.status(400).send({ Error: 'One or more parameters are missing.' });

    Question.create({
        id_categoria,
        question,
        option_0, option_1, option_2, option_3,
        right_answer_index
    })
    .then((newQuestion) => res.status(201).send(newQuestion))
    .catch((err) => res.status(500).send({ Error: err.message }));
}

// PUT /questions/:id
function updateQuestion(req, res) {
    Question.update(req.body, { where: { id_pregunta: req.params.id } })
    .then(([rowsUpdated]) => {
        if (rowsUpdated)
            res.status(200).send({ message: 'Question updated.' });
        else
            res.status(404).send({ Error: 'Question not found.' });
    })
    .catch((err) => res.status(500).send({ Error: err.message }));
}

// DELETE /questions/:id
function deleteQuestion(req, res) {
    Question.destroy({ where: { id_pregunta: req.params.id } })
        .then((rowsDeleted) => {
        if (rowsDeleted)
            res.status(200).send({ message: 'Question deleted.' });
        else
            res.status(404).send({ Error: 'Question not found.' });
        })
        .catch((err) => res.status(500).send({ Error: err.message }));
}

module.exports = { getQuestionByID, getAllQuestions, saveNewQuestion, updateQuestion, deleteQuestion };