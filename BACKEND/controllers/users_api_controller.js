require('dotenv').config();
const { User, UserHistory, Question, Achievement } = require('../models');
const bcrypt = require('bcrypt');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const snsClient = new SNSClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_1,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_1,
        sessionToken: process.env.AWS_SESSION_TOKEN_1
    }
});

// POST /users
async function createUser(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).send({ Error: 'One or more parameters are missing.' });

    try {
        const exists = await User.findOne({ where: { email } });
        if (exists)
            return res.status(409).send({ Error: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashed, points: 0 });
    const { password: _, ...userSafe } = newUser.toJSON();
    res.status(201).send(userSafe);
    } catch (err) {
        res.status(500).send({ Error: err.message });
    }
}

// POST /login
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).send({ Error: 'Email and password are required.' });

    try {
        const user = await User.findOne({ where: { email } });
        if (!user)
            return res.status(404).send({ Error: 'User not found.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
        return res.status(401).send({ Error: 'Invalid credentials.' });

    const { password: _, ...userSafe } = user.toJSON();
    res.status(200).send(userSafe);
    } catch (err) {
        res.status(500).send({ Error: err.message });
    }
}

// GET /users/:id
function getUserInfo(req, res) {
    User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] },
        include: [{ model: Achievement }]
    })
    .then((user) => {
        if (user) res.status(200).send(user);
        else res.status(404).send({ Error: 'User not found.' });
    })
    .catch((err) => res.status(500).send({ Error: err.message }));
}

// PUT /users/:id
async function editUserInfo(req, res) {
    if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    User.update(req.body, { where: { id_usuario: req.params.id } })
    .then(([rowsUpdated]) => {
        if (rowsUpdated) res.status(200).send({ message: 'User updated.' });
        else res.status(404).send({ Error: 'User not found.' });
    })
    .catch((err) => res.status(500).send({ Error: err.message }));
}

// DELETE /users/:id
function deleteUser(req, res) {
    User.destroy({ where: { id_usuario: req.params.id } })
    .then((rowsDeleted) => {
        if (rowsDeleted) res.status(200).send({ message: 'User deleted.' });
        else res.status(404).send({ Error: 'User not found.' });
    })
    .catch((err) => res.status(500).send({ Error: err.message }));
}

// GET /histories/:id
function getUserHistory(req, res) {
    UserHistory.findAll({
        where: { id_usuario: req.params.id },
        include: [{ model: Question }],
        order: [['fecha_respuesta', 'DESC']]
    })
    .then((history) => res.status(200).send(history))
    .catch((err) => res.status(500).send({ Error: err.message }));
}

// POST /histories/:id
async function addUserHistory(req, res) {
    const { id_pregunta, es_correcta } = req.body;

    if (!id_pregunta || es_correcta === undefined)
        return res.status(400).send({ Error: 'id_pregunta and es_correcta are required.' });

    try {
        const newRecord = await UserHistory.create({
            id_usuario: req.params.id,
            id_pregunta,
            es_correcta
        });

    if (es_correcta) {
        await User.increment('points', { by: 10, where: { id_usuario: req.params.id } });
    }

    if (process.env.SNS_TOPIC_ARN) {
        const estado = es_correcta ? 'correcta' : 'incorrecta';
        try {
        await snsClient.send(new PublishCommand({
            Message: `El usuario con ID ${req.params.id} respondió una pregunta de forma ${estado}.`,
            Subject: 'Actividad en Triviaverso',
            TopicArn: process.env.SNS_TOPIC_ARN
        }));
        } catch (snsErr) {
            console.error('Error enviando a SNS:', snsErr.message);
        }
    }

    res.status(200).send(newRecord);
    } catch (err) {
        res.status(500).send({ Error: err.message });
    }
}

// GET /rank
function getTopUsers(req, res) {
    User.findAll({
        attributes: { exclude: ['password', 'email'] },
        order: [['points', 'DESC']],
        limit: 10
    })
    .then((users) => res.status(200).send(users))
    .catch((err) => res.status(500).send({ Error: err.message }));
}

module.exports = { createUser, login, getUserInfo, editUserInfo, deleteUser, getUserHistory, addUserHistory, getTopUsers };