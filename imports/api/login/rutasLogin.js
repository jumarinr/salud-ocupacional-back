const express = require('express');
const cors = require('cors');

const router = express.Router();
router.use(cors());

const Empleado = require("../../collections/empleadoSchema");

// Logearse al sistema
router.post('/', (req, res) => {

    Empleado.findOne({correo: req.body.correo})
    .then(usuarioEncontrado => {
        if(usuarioEncontrado) {
            if (usuarioEncontrado.identificacion === req.body.contrasena) {
                res.json({error: false, mensaje: "Logeado con exito"})
            } else {
                res.json({error: true, mensaje: "Contrasena incorrecta"})
            }
        } else {
            res.json({error: true, mensaje: "Usuario no existe"})
        }
    })
    .catch(err => {
        res.send('error: ' + err)
    })
})

module.exports = router