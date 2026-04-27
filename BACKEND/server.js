//-----------IMPORTACIONES-----------//
const express = require('express');
const mongoose = require('mongoose');
const chalk = require('chalk');
const cors = require('cors');
const routerApi = require('./routes/api.js');
const dye = chalk;

//-----------CONFIGURACION-----------//
const app = express();
const port = process.env.PORT || 3000;


const db = mongoose.connection;
db.on(`connecting`, () => {
    console.log(dye.yellow(`Conectando a base de datos...`));
});

db.on(`connected`, () => {
    console.log(dye.greenBright(`Conexion exitosa a MongoDB!`));
    app.listen(port, () => {
        console.log(dye.underline.blackBright(`Proyecto corriendo en el puerto ${port}!`));
    });
});


//-----------MIDDLEWARE-----------//
app.use(cors());
app.use(express.json());
app.use(routerApi);

//-----------CONEXION-----------//
mongoose.connect(mongoConnection);