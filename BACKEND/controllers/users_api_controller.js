//-----------IMPORTACIONES-----------//
const mongoose = require('mongoose');
const UserHistory = require('../models/user_history.js');
const User = require('../models/user.js');
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

// Configuracion de SNS usando tus credenciales de Usuario 1
const snsClient = new SNSClient({ 
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_1,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_1,
        sessionToken: process.env.AWS_SESSION_TOKEN_1 
    }
});

//-----------FUNCIONES CRUD-----------//

function addUserHistory(req, res) {
   let questionID = req.body.question;
   let correct = req.body.correct;
   let updateData = {questions: {question: questionID, correct: correct}};
   
   UserHistory.findOneAndUpdate({user_id: req.params.id},
                         {$push: updateData},
                         {new: true, runValidators: true})
       .then(async (response) => {
           if (response) {
               // INTEGRACION SNS: Enviar notificacion al responder una pregunta
               if (process.env.SNS_TOPIC_ARN) {
                   const estado = correct ? "correcta" : "incorrecta";
                   const params = {
                       Message: `El usuario con ID ${req.params.id} ha respondido una pregunta de forma ${estado}.`,
                       Subject: "Actividad en Triviaverso",
                       TopicArn: process.env.SNS_TOPIC_ARN
                   };

                   try {
                       await snsClient.send(new PublishCommand(params));
                   } catch (snsErr) {
                       console.error("Error enviando a SNS:", snsErr.message);
                   }
               }
               res.status(200).send(response);
           } else {
               res.status(404).send({"Error": "History not found."});
           }
       }).catch((err) => {res.status(500).send({"Error": err.message})});
}

//-----------EXPORTACIONES-----------//
module.exports = {createUser, login, getUserInfo, editUserInfo, deleteUser, getUserHistory, addUserHistory, getTopUsers};