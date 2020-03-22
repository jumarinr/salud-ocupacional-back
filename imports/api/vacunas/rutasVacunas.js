const express = require("express");

const router = express.Router();

const Vacuna = require("../../collections/vacunaSchema");
const Empleado = require("../../collections/empleadoSchema");

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

router.post("/informe", (req, res) => {
    const fechaI = new Date(req.body.fechaI)
    const fechaF = new Date(req.body.fechaF)
    var vacunasYapl = []
    var empleadosYapl = {}
    var aplTotal = {}
    resultado = []

    Empleado.find({}).
    populate("detallesVacunacion.vacuna").
    then(empleados => {
        for (var empleado of empleados) {
            for (var det of empleado.detallesVacunacion) {
                var aplicaciones = []
                for (var apl of det.aplicaciones) {
                    var fechaAplicacion = new Date(apl.fecha)
                    if (fechaAplicacion >= fechaI && fechaAplicacion <= fechaF) {
                       aplicaciones.push(apl) 
                    }
                }
                if (aplicaciones.length > 0) {
                    vacunasYapl.push({"vacuna": det.vacuna.nombre, aplicaciones: aplicaciones, empleadosVac: 0, idDetalle: det._id}) //Se guarda el id del detalle para poder luego encontrar la cantidad de empleados vacunados con cada vacuna
                }
            }
        }

        Empleado.find({}).populate("detallesVacunacion.vacuna").then(empleados => {
            for (var empleado of empleados) {
                for (var det of empleado.detallesVacunacion) {
                    for (var detAplicado of vacunasYapl) {
                        if (det._id.equals(detAplicado.idDetalle)) {
                            vacunasYapl[vacunasYapl.indexOf(detAplicado)].empleadosVac += 1 
                        }
                    }
                }
            }

            for (var i of vacunasYapl) {
                var nombreVacuna = i.vacuna
                if (aplTotal.hasOwnProperty(nombreVacuna)) {
                    aplTotal[nombreVacuna].aplicaciones = aplTotal[nombreVacuna].aplicaciones.concat(i.aplicaciones)
                    aplTotal[nombreVacuna].empleadosVac += i.empleadosVac; 
                } else {
                    aplTotal[nombreVacuna] = {aplicaciones: i.aplicaciones, empleadosVac: i.empleadosVac};
                }
            }
    
            for (var p in aplTotal) {
                var nombre = p
                var cantAplicada = aplTotal[p].aplicaciones.length
                var subtotal = 0
                for (var sub of aplTotal[p].aplicaciones) {
                    subtotal += sub.precio
                }
                var cantEmpleadosVac = aplTotal[p].empleadosVac
                resultado.push({nombre: nombre, cantidadVecesAplicada: cantAplicada, cantidadEmpleadosVacunados: cantEmpleadosVac, subtotal: subtotal})
            }
    
            res.json({resultados: resultado});

        }).catch(err => {
            res.json({error: true, mensaje: "Error al buscar los empleados", datos: err});
        });

    }).catch(err => {
        res.json({error: true, mensaje: "Error al buscar los empleados", datos: err});
    });

});

module.exports = router;