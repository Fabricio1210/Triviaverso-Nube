require('dotenv').config();
const { User, UserHistory, Question, Achievement, Category } = require('../models');
const bcrypt = require('bcrypt');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

// Cliente de SNS configurado con tus credenciales de Usuario 1
const snsClient = new SNSClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_1,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_1,
        sessionToken: process.env.AWS_SESSION_TOKEN_1
    }
});

// Funcion interna para centralizar el envio de notificaciones
async function enviarNotificacionSNS(asunto, mensaje) {
    if (process.env.SNS_TOPIC_ARN) {
        try {
            await snsClient.send(new PublishCommand({
                Message: mensaje,
                Subject: asunto,
                TopicArn: process.env.SNS_TOPIC_ARN
            }));
        } catch (err) {
            console.error('Error enviando a SNS:', err.message);
        }
    }
}

// POST /users
async function createUser(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).send({ Error: 'Faltan parametros requeridos.' });

    try {
        const exists = await User.findOne({ where: { email } });
        if (exists)
            return res.status(409).send({ Error: 'Email ya registrado.' });

        const hashed = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashed, points: 0 });

        // NOTIFICACION: Solo se envia al registrarse
        await enviarNotificacionSNS(
            'Nuevo Registro - Triviaverso',
            `El usuario ${name} (${email}) se ha registrado exitosamente.`
        );

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
        return res.status(400).send({ Error: 'Email y password son necesarios.' });

    try {
        const user = await User.findOne({ where: { email } });
        if (!user)
            return res.status(404).send({ Error: 'Usuario no encontrado.' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            return res.status(401).send({ Error: 'Credenciales incorrectas.' });

        // NOTIFICACION: Alerta de inicio de sesion
        await enviarNotificacionSNS(
            'Alerta de Inicio de Sesion',
            `El usuario ${user.name} ha accedido a su cuenta.`
        );

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
  delete req.body.points; // proteger puntos

    if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    try {
    await User.update(req.body, { where: { id_usuario: req.params.id } });
    const userActualizado = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] }
    });
    if(!userActualizado) return res.status(404).send({ Error: 'User not found.' });
    res.status(200).send(userActualizado);
    } catch(err) {
        res.status(500).send({ Error: err.message });
    }
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
    include: [{
        model: Question,
        include: [{ model: Category }]
    }],
    order: [['fecha_respuesta', 'DESC']]
    })
    .then((history) => res.status(200).send(history))
    .catch((err) => res.status(500).send({ Error: err.message }));
}

// POST /histories/:id (SNS ELIMINADo PARA EVITAR SPAM)
async function addUserHistory(req, res) {
    const { id_pregunta, es_correcta } = req.body;
    if (!id_pregunta || es_correcta === undefined)
        return res.status(400).send({ Error: 'id_pregunta y es_correcta son obligatorios.' });

    try {
        const newRecord = await UserHistory.create({
            id_usuario: req.params.id,
            id_pregunta,
            es_correcta
        });

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

async function updatePoints(req, res) {
    try {
        const user = await User.findByPk(req.params.id);
        if(!user) return res.status(404).send({ Error: 'User not found.' });

        if(req.body.points > user.points) {
            await user.update({ points: req.body.points });
        }

        const { password: _, ...userSafe } = user.toJSON();
        res.status(200).send(userSafe);
    } catch(err) {
        res.status(500).send({ Error: err.message });
    }
}

module.exports = { createUser, login, getUserInfo, editUserInfo, deleteUser, getUserHistory, addUserHistory, getTopUsers, updatePoints };