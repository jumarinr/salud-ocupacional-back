const express = require('express');
const router = express.Router();
const cors = require('cors');

const User = require("../../collections/usuarioSchema");
router.use(cors());

router.post('/login', (req, res) => {

    User.findOne({correo: req.body.correo}).then(user => {
        if(user) {
            if (user.identificacion === req.body.contrasena) {
                res.json({status: true})
            } else {
                res.json({error: 'Contrasena incorrcta'})
            }

        } else {
            res.json({error: 'Usuario no existe'})
        }

    }).catch(err => {
        res.send('error: ' + err)
    })
})

module.exports = router