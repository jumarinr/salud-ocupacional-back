const express = require("express");
const cors = require('cors');

const router = express.Router();
router.use(cors());

const Vacuna = require("../../collections/vacunaSchema");

// Obtener vacunas
router.get('/',(req,res) => {

    Vacuna.find({}).
    then(vacunasRetornadas =>{
        res.json({error: false, datos: vacunasRetornadas});
    })
    .catch(err =>{
        res.json("Error: " + err);
    })
})

// Agregar vacunas
router.post("/", (req,res)=>{

    const nuevaVacuna = new Vacuna({
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        periodicidad: req.body.periodicidad,
        cantidadAplicar: req.body.cantidadAplicar,
        prestadorServicio : req.body.prestadorServicio
    });

    Vacuna.findOne({nombre : req.body.nombre}).
    then(vacunaEncontrada => {
        if(!vacunaEncontrada){
            nuevaVacuna.save()
            .then(exito => {
                res.json({error: false, mensaje: "Vacuna guardada correctamente"})
            }).catch(err => {
                res.send('Error: ' + err)
            })
        }else{
            res.json({error: true, mensaje: "Ya existe esa vacuna en la base de datos"})
        }
    }).catch(err => {
        res.send('Error: ' + err)
    })
})

module.exports = router;