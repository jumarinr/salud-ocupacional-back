const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Empleado = require("../../collections/empleadoSchema");

//------REQUIRE DE FUNCIONES CREADAS------
const funcPromesasVacunas = require("../../functions/arregloPromesas");


// Obtener empleados
router.get("/", (req,res)=>{

    Empleado.find({}).
    populate("detallesVacunacion.vacuna").
    then(empleadosRetornados =>{
        res.json({error: false, datos: empleadosRetornados});
    })
    .catch(err =>{
        res.json({error: true, mensaje: "Error al buscar empleados", datos: err})
    })

})


// Obtener un unico empleado
router.get("/:id", (req,res) =>{

    Empleado.findById(req.params.id).
    populate("detallesVacunacion.vacuna").
    then(empleadoRetornado =>{
        res.json({error: false, datos: empleadoRetornado});
    })
    .catch(err =>{
        res.json({error: true, mensaje: "Error al buscar el empleado pedido", datos: err})
    })

})


// Agregar empleados
router.post("/", (req,res) =>{

    let area = null;

    if (req.body.tipoTrabajador){
        area = "Empleado salud"
    }else{
        area = "Empleado normal"
    }

    let detallesVacunasGuar  = funcPromesasVacunas(req.body.detallesVacunacion);

    detallesVacunasGuar.then(arregloRetornado =>{

        let arregloDetallesVacunacion = []

        for (idVacuna of arregloRetornado){
            arregloDetallesVacunacion.push({
            vacuna: new mongoose.mongo.ObjectId(idVacuna._id),
            cantidadAplicada: 0, // Por ahora es cero(según la historia de usuario), en un futuro se debe mandar por el request.
            registradoPor: new mongoose.mongo.ObjectId(req.session.datos.id)
        })
        }

        const nuevoEmpleado = new Empleado({
            tipoIdentificacion : req.body.tipoDocumento,
            identificacion : req.body.documento,
            correo : req.body.correo,
            nombres : req.body.nombres,
            apellidos : req.body.apellidos,
            fechaNacimiento : req.body.fechaNacimiento,
            direccion : req.body.direccion,
            telefono : req.body.telefono,
            celular : req.body.celular,
            contactoAllegado : req.body.telefonoFamiliar,
            nivelRiesgoLaboral : req.body.nivelRiesgo,
            areaTrabajo : area,
            registradoPor : new mongoose.mongo.ObjectId(req.session.datos.id),
            detallesVacunacion : arregloDetallesVacunacion
        }, (err) => {
            if (err) res.json({error: true, mensaje: "Ya existe un usuario con esa informacion"});
        })

        nuevoEmpleado.save().
        then(exito => {
            res.json({error: false, mensaje: "Se guardo el empleado correctamente"})
        })
        .catch(err =>{
            res.json({error: true, mensaje: "Error al crear el empleado", datos: err})
        });
    })
    .catch(err =>{
        res.json({error: true, mensaje: "Error al crear el empleado", datos: err})
    })
});


//Actualizar empleado
router.put("/:id", (req,res) =>{

    let area = null;

    if (req.body.tipoTrabajador){
        area = "Empleado salud"
    }else{
        area = "Empleado normal"
    }

    let detallesVacunasGuar  = funcPromesasVacunas(req.body.detallesVacunacion);

    detallesVacunasGuar.then(arregloRetornado =>{

        let arregloDetallesVacunacion = []

        for (idVacuna of arregloRetornado){
            arregloDetallesVacunacion.push({
            vacuna: new mongoose.mongo.ObjectId(idVacuna._id),
            cantidadAplicada: 0, // Por ahora es cero(según la historia de usuario), en un futuro se debe mandar por el request.
            registradoPor: new mongoose.mongo.ObjectId(req.session.datos.id)
            })
        }

        Empleado.findByIdAndUpdate(req.params.id,
            {$set: {tipoIdentificacion: req.body.tipoDocumento,
                    identificacion : req.body.documento,
                    correo : req.body.correo,
                    nombres : req.body.nombres,
                    apellidos : req.body.apellidos,
                    fechaNacimiento : req.body.fechaNacimiento,
                    direccion : req.body.direccion,
                    telefono : req.body.telefono,
                    celular : req.body.celular,
                    contactoAllegado : req.body.telefonoFamiliar,
                    nivelRiesgoLaboral : req.body.nivelRiesgo,
                    areaTrabajo : area,
                    detallesVacunacion : arregloDetallesVacunacion}},{new:true})
        .then(empleadoActualizado =>{
            res.json({error: false, mensaje: "Se actualizo la informacion del empleado con exito", datos: empleadoActualizado})
        })
        .catch(err =>{
            res.json({error: true, mensaje: "Error al actualizar la informacion del empleado", datos: err})
        })
    })
    .catch(err =>{
        res.json({error: true, mensaje: "Error al actualizar el empleado", datos: err})
    })
})


//Eliminar empleado
router.delete("/:id", (req, res) => {
    Empleado.findByIdAndRemove(req.params.id)
    .then(trabajador => {
        res.json({error: false, mensaje: "Se eliminó el empleado correctamente"})
    })
    .catch(err =>{
        res.json({error: true, mensaje: "No se pudo eliminar el empleado", datos: err})
    })
});


module.exports = router;
