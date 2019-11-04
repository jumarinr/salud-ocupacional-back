const express = require("express");

const router = express.Router();

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


// Obtener una unica vacuna por ID
router.get('/:id',(req,res) => {

    Vacuna.findById(req.params.id).
    then(vacunaRetornada =>{
        res.json({error: false, datos: vacunaRetornada});
    })
    .catch(err =>{
        res.json({error: true, mensaje: "Error al buscar la vacuna solicitada", datos: err})
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