//-----------IMPORTACIONES-----------//
const express = require('express');
const cors = require('cors');
const routerApi = require('./routes/api.js');
const { sequelize } = require('./models');
const path = require('path');

//-----------CONFIGURACION-----------//
const app = express();
const port = process.env.PORT || 3000;

//-----------MIDDLEWARE-----------//
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../FRONTEND')));
app.use(routerApi);

//-----------CONEXION-----------//
sequelize.authenticate()
    .then(() => {
        console.log('Conectando a base de datos...');
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log('Conexion exitosa a RDS!');
        app.listen(port, () => {
            console.log(`Proyecto corriendo en el puerto ${port}!`);
        });
    })
    .catch((err) => {
        console.error('Error al conectar a la base de datos:', err.message);
        process.exit(1);
    });