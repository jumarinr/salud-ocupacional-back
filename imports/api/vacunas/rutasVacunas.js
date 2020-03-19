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
        precio: req.body.precio,
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

router.put("/:id", (req, res) => {

    Vacuna.findByIdAndUpdate(req.params.id, 
        {$set: {nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                periodicidad: req.body.periodicidad,
                cantidadAplicar: req.body.cantidadAplicar,
                precio: req.body.precio,
                prestadorServicio: req.body.prestadorServicio}}, {new: true})
        .then(vacunaActualizada => {
            res.json({error: false, mensaje: "Se actualizó la información de la vacuna con éxito", datos: vacunaActualizada})
        })
        .catch(err => {
            res.json({error: true, mensaje: "Error al actualizar la información de la vacuna", datos: err})
        })
})

router.delete('/:idVacuna', (req, res) => {

    Vacuna.findById(req.params.idVacuna)
        .then(vacunaEncontrada => {
            vacunaEncontrada.remove()   // Cuando se hace vacuna.remove(), se ejecuta el middleware vacunaSchema.pre() en vacunaSchema.js
            .then(vacunaRemovida => {
                res.json({error: false, mensaje: "Vacuna removida con éxito", datos: vacunaRemovida});
            })
            .catch(err => {
                res.json({error: true, mensaje: "Error al remover la vacuna", datos: err});
            })
        })
        .catch(err => {
            res.json({error: true, mensaje: "La vacuna no fue encontrada", datos: err});
        })        
});

module.exports = router;