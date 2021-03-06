const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Empleado = require("../../collections/empleadoSchema");
const DetalleVacunacion = require("../../collections/detallesVacunacionSchema").model
const AplicacionVacuna = require("../../collections/aplicacionesSchema").model;
const Vacuna = require("../../collections/vacunaSchema");

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
            aplicaciones: [],
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
            res.json({error: true, mensaje: "El trabajador ya se encuentra registrado: correo o documento repetido", datos: err})
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
        Empleado.findById(req.params.id).then(empleadoRetornado => {
            let arregloDetallesVacunacion = []

            for (idVacuna of arregloRetornado){
                if (empleadoRetornado.detallesVacunacion.filter(detalle => detalle.vacuna.toString() == idVacuna._id.toString()).length == 0) {
                    // Si el usuario no tenía la vacuna previamente registrada, se crea un nuevo detalle de vacunación
                    arregloDetallesVacunacion.push({
                        vacuna: new mongoose.mongo.ObjectId(idVacuna._id),
                        cantidadAplicada: 0, // Por ahora es cero(según la historia de usuario), en un futuro se debe mandar por el request.
                        aplicaciones: [],
                        registradoPor: new mongoose.mongo.ObjectId(req.session.datos.id)
                    })
                } else {
                    // Si el usuario tenía la vacuna previamente registrada, se almacena el mismo detalle de vacunación
                    arregloDetallesVacunacion.push(empleadoRetornado.detallesVacunacion.filter(detalle => detalle.vacuna.toString() == idVacuna._id.toString())[0])
                }
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
        }).catch(err => {
            res.json({error: true, mensaje: "Empleado no encontrado", datos: err})
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


//Obtener aplicaciones de cierta vacuna de un empleado
router.get("/:idEmpleado/vacunas/:idVacuna", (req,res) =>{
    Empleado.findById(req.params.idEmpleado)
    .populate("detallesVacunacion.vacuna")
    .then(trabajador =>{

        detalleBuscado = null

        for (elemento of trabajador.detallesVacunacion){
            console.log(elemento.vacuna._id)
            if (elemento.vacuna._id == req.params.idVacuna){

                detalleBuscado = elemento;
                break;

            }
        }
        if (detalleBuscado != null){
            return res.json({error: false, mensaje: "Se ha encontrado el detalle de vacunación", datos: detalleBuscado})
        }
        return res.json({error: true, mensaje: "No existen aplicaciones de dicha vacuna en el empleado"})
    })
    .catch(err =>{
        res.json({error: true, mensaje: "Error al buscar el empleado", datos: err})
    })

})


//Aplicar Vacuna empleado
router.post("/:idEmpleado/vacunas/:idVacuna", (req,res) =>{

    Vacuna.findById(req.params.idVacuna).
        then(vacunaRetornada =>{

            Empleado.findById(req.params.idEmpleado).
            populate("detallesVacunacion.vacuna")
            .then(trabajador =>{

                let nuevoDetallesVacunacion = []
                let fechaActual = new Date();        
                let fechaIngresada = new Date(req.body.fechaAplicacion)

            if (fechaIngresada.getTime() == fechaActual.getTime()){
                return res.json({error: true, mensaje: "No se puede aplicar una vacuna en una fecha igual a la fecha actual (Exactamente a la misma hora del dia)."})
            }
            else if (fechaIngresada.getTime() > fechaActual.getTime()){
                return res.json({error: true, mensaje: "No se puede aplicar una vacuna en una fecha posterior al dia de hoy."})
            }
            else{
                for (elemento of trabajador.detallesVacunacion){

                    if (elemento.vacuna._id == req.params.idVacuna){

                        if (elemento.aplicaciones.length == 0){

                            let nuevasAplicaciones = []

                            let nuevaAplicacion = {
                                fecha: fechaIngresada,
                                precio: vacunaRetornada.precio
                                }
                            
                            nuevasAplicaciones.push(nuevaAplicacion)

                            let nuevoElementoDetalle = {
                                vacuna: new mongoose.mongo.ObjectId(req.params.idVacuna),
                                cantidadAplicada: 1,
                                aplicaciones: nuevasAplicaciones,
                                registradoPor: new mongoose.mongo.ObjectId(req.session.datos.id)
                            }
                            nuevoDetallesVacunacion.push(nuevoElementoDetalle)

                        }
                        else{

                            let ultimaFecha = new Date(elemento.aplicaciones[elemento.aplicaciones.length-1].fecha)

                            if (fechaIngresada.getTime() < ultimaFecha.getTime()){
                                return res.json({error: true, mensaje: "No se puede aplicar una vacuna en una fecha anterior a la ultima fecha de aplicación."})
                            }
                            else if (fechaIngresada.getTime() == ultimaFecha.getTime()){
                                return res.json({error: true, mensaje: "No se puede aplicar una vacuna en una fecha igual a la ultima fecha de aplicación."})
                            }
                            else{

                                let nuevasAplicaciones = elemento.aplicaciones

                                let nuevaAplicacion = {
                                    fecha: fechaIngresada,
                                    precio: vacunaRetornada.precio
                                    }

                                nuevasAplicaciones.push(nuevaAplicacion)

                                let nuevoElementoDetalle = {
                                    vacuna: new mongoose.mongo.ObjectId(req.params.idVacuna),
                                    cantidadAplicada: Number(elemento.cantidadAplicada) + 1,
                                    aplicaciones: nuevasAplicaciones,
                                    registradoPor: new mongoose.mongo.ObjectId(req.session.datos.id)
                                }

                                nuevoDetallesVacunacion.push(nuevoElementoDetalle)

                            }
                        }
                    }
                    else{
                        nuevoDetallesVacunacion.push(elemento)
                    }
                }
            }
            Empleado.findByIdAndUpdate(req.params.idEmpleado,{$set: {detallesVacunacion: nuevoDetallesVacunacion}},{new:true})
            .then(empleadoActualizado =>{
                res.json({error: false, mensaje: "Vacuna aplicada con exito", datos: empleadoActualizado})
            })
            .catch(err =>{
                res.json({error: true, mensaje: "No se pudo aplicar la vacuna", datos: err})
            })
            })
        .catch(err =>{
            res.json({error: true, mensaje: "Empleado no encontrado", datos: err})
        })
                                
        })
        .catch(err =>{
            res.json({error: true, mensaje: "Error al buscar la vacuna solicitada", datos: err})
        })
   
})


//Actualizar Vacuna empleado
router.put("/:idEmpleado/vacunas/:idVacuna", (req,res) =>{

    Empleado.findById(req.params.idEmpleado).
    populate("detallesVacunacion.vacuna")
    .then(trabajador =>{

        let numeroAplicacion = req.body.numAplicacion
        let nuevoDetallesVacunacion = []
        let fechaActual = new Date();        
        let fechaIngresada = new Date(req.body.fechaAplicacion)

        if (fechaIngresada.getTime() > fechaActual.getTime()){
            return res.json({error: true, mensaje: "No sé puede modificar una fecha de aplicacion a una fecha posterior a la fecha actual."})
        }
        else{
            for (elemento of trabajador.detallesVacunacion){

                if (elemento.vacuna._id == req.params.idVacuna){

                    let fechaAnioAtras = new Date(elemento.aplicaciones[0].fecha)
                    fechaAnioAtras.setMonth(fechaAnioAtras.getMonth() - 12)

                    console.log(fechaAnioAtras)


                    if (numeroAplicacion == elemento.aplicaciones.length){  // Se quiere actualizar el ultimo elemento
                        if(elemento.aplicaciones.length > 1){
                            if (fechaIngresada.getTime() < elemento.aplicaciones[numeroAplicacion-2].fecha.getTime()){
                                return res.json({error: true, mensaje: "No sé puede modificar la ultima fecha de aplicación porque es anterior a la penultima fecha de aplicación"})
                            }
                            else if (fechaIngresada.getTime() == elemento.aplicaciones[numeroAplicacion-2].fecha.getTime()){
                                return res.json({error: true, mensaje: "No sé puede modificar la ultima fecha de aplicación porque es igual a la penultima"})
                            }

                        }
                        else {
                            if (fechaIngresada.getTime() < fechaAnioAtras.getTime()){
                                return res.json({error: true, mensaje: `No sé puede modificar la ultima fecha de aplicación porque es anterior a la fecha: ${fechaAnioAtras}, es decir, un año anterior a la primera fecha de aplicación`})
                            }
                        }
                        
                        let nuevasAplicaciones = elemento.aplicaciones
                        let precioAplicacionEliminada = nuevasAplicaciones.pop().precio
          
                        nuevasAplicaciones.push({
                            fecha: fechaIngresada,
                            precio: precioAplicacionEliminada
                            })

                        let nuevoElementoDetalle = {
                            vacuna: new mongoose.mongo.ObjectId(req.params.idVacuna),
                            cantidadAplicada: Number(elemento.cantidadAplicada),
                            aplicaciones: nuevasAplicaciones,
                            registradoPor: new mongoose.mongo.ObjectId(req.session.datos.id)
                        }

                        nuevoDetallesVacunacion.push(nuevoElementoDetalle)

                    }

                    else if(numeroAplicacion == 1){ // Se quiere actualizar el primer elemento
                        if (fechaIngresada.getTime() > elemento.aplicaciones[numeroAplicacion].fecha.getTime()){
                            return res.json({error: true, mensaje: "No sé puede modificar la primera fecha de aplicación porque es posterior a la segunda fecha de aplicación"})
                        }
                        else if (fechaIngresada.getTime() == elemento.aplicaciones[numeroAplicacion].fecha.getTime()){
                            return res.json({error: true, mensaje: "No sé puede modificar la primera fecha de aplicación porque es igual a la segunda fecha de aplicación"})
                        }
                        else if (fechaIngresada.getTime() < fechaAnioAtras.getTime()){
                            return res.json({error: true, mensaje: `No sé puede modificar la primera fecha de aplicación porque es anterior a la fecha: ${fechaAnioAtras}, es decir, un año anterior a la primera fecha de aplicación`})
                        }

                        let nuevasAplicaciones = elemento.aplicaciones
                        nuevasAplicaciones[numeroAplicacion-1].fecha = fechaIngresada
                        console.log(fechaIngresada)
                        console.log(nuevasAplicaciones)

                        let nuevoElementoDetalle = {
                            vacuna: new mongoose.mongo.ObjectId(req.params.idVacuna),
                            cantidadAplicada: Number(elemento.cantidadAplicada),
                            aplicaciones: nuevasAplicaciones,
                            registradoPor: new mongoose.mongo.ObjectId(req.session.datos.id)
                        }

                        nuevoDetallesVacunacion.push(nuevoElementoDetalle)


                    }

                    else{ // Se quiere actualizar un elemento intermedio 

                        if (fechaIngresada.getTime() < elemento.aplicaciones[numeroAplicacion-2].fecha.getTime()){
                            return res.json({error: true, mensaje: `No sé puede modificar la aplicación #${numeroAplicacion} ya que se ingreso una fecha anterior a la aplicación #${numeroAplicacion-1}`})
                        }
                        else if (fechaIngresada.getTime() > elemento.aplicaciones[numeroAplicacion].fecha.getTime()){
                            return res.json({error: true, mensaje: `No sé puede modificar la aplicación #${numeroAplicacion} ya que se ingreso una fecha posterior a la aplicación #${numeroAplicacion+1}`})
                        }

                        let nuevasAplicaciones = elemento.aplicaciones
                        nuevasAplicaciones[numeroAplicacion-1].fecha = fechaIngresada

                        let nuevoElementoDetalle = {
                            vacuna: new mongoose.mongo.ObjectId(req.params.idVacuna),
                            cantidadAplicada: Number(elemento.cantidadAplicada),
                            aplicaciones: nuevasAplicaciones,
                            registradoPor: new mongoose.mongo.ObjectId(req.session.datos.id)
                        }

                        nuevoDetallesVacunacion.push(nuevoElementoDetalle)

                    }

                }
                else{
                    nuevoDetallesVacunacion.push(elemento)
                }
            }
        }
        Empleado.findByIdAndUpdate(req.params.idEmpleado,{$set: {detallesVacunacion: nuevoDetallesVacunacion}},{new:true})
        .then(empleadoActualizado =>{
            res.json({error: false, mensaje: "Aplicacion de la vacuna actualizada con exito.", datos: empleadoActualizado})
        })
        .catch(err =>{
            res.json({error: true, mensaje: "No se pudo actualizar la Aplicacion de la vacuna.", datos: err})
        })
    })
    .catch(err =>{
        res.json({error: true, mensaje: "Empleado no encontrado.", datos: err})
    })
})


//Eliminar Vacuna empleado
router.delete("/:idEmpleado/vacunas/:idVacuna", (req,res) =>{

    Empleado.findById(req.params.idEmpleado).
    populate("detallesVacunacion.vacuna")
    .then(trabajador =>{

        let numeroAplicacion = req.body.numAplicacion
        let nuevoDetallesVacunacion = []

        for (elemento of trabajador.detallesVacunacion){

            if (elemento.vacuna._id == req.params.idVacuna){

                let nuevasAplicaciones = elemento.aplicaciones
                nuevasAplicaciones.splice(numeroAplicacion-1,1)

                let nuevoElementoDetalle = {
                    vacuna: new mongoose.mongo.ObjectId(req.params.idVacuna),
                    cantidadAplicada: Number(elemento.cantidadAplicada) - 1,
                    aplicaciones: nuevasAplicaciones,
                    registradoPor: new mongoose.mongo.ObjectId(req.session.datos.id)
                }

                nuevoDetallesVacunacion.push(nuevoElementoDetalle)

            }
            else{
                nuevoDetallesVacunacion.push(elemento)
            }
        }
        Empleado.findByIdAndUpdate(req.params.idEmpleado,{$set: {detallesVacunacion: nuevoDetallesVacunacion}},{new:true})
        .then(empleadoActualizado =>{
            res.json({error: false, mensaje: "Aplicacion de la vacuna eliminada con exito.", datos: empleadoActualizado})
        })
        .catch(err =>{
            res.json({error: true, mensaje: "No se pudo eliminar la aplicacion de la vacuna.", datos: err})
        })
    })
    .catch(err =>{
        res.json({error: true, mensaje: "Empleado no encontrado.", datos: err})
    })

})


module.exports = router;
