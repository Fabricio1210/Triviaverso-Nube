const { Category } = require('../models');

function getAllCategories(req, res) {
    Category.findAll()
    .then(cats => res.status(200).send(cats))
    .catch(err => res.status(500).send({ Error: err.message }));
}

module.exports = { getAllCategories };