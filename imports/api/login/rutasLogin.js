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
                req.session.datos = {
                    id: usuarioEncontrado._id,
                    identificacion : usuarioEncontrado.identificacion,
                    nombres : usuarioEncontrado.nombres,
                    areaTrabajo : usuarioEncontrado.areaTrabajo
                }
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


// Cerrar sesion
router.delete('/', (req,res) =>{
    console.log(req.session.datos)
    req.session.destroy(err =>{
        if (err) res.json({error: true, mensaje: "No se pudo cerrar la sesion correctamente"})
        res.json({error: false, mensaje: "Se cerro la sesion correctamente"})
    })
    
})

module.exports = router