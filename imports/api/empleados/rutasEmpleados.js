const express = require("express");
const cors = require('cors');

const router = express.Router();
router.use(cors());

const Empleado = require("../../collections/empleadoSchema");
const Vacuna = require("../../collections/vacunaSchema");

// Obtener empleados
router.get("/", (req,res)=>{

    Empleado.find({}).
    then(empleadosRetornados =>{
        res.json({error: false, datos: empleadosRetornados, datosSesion: req.session.datos});
    })
    .catch(err =>{
        res.json({error: true, mensaje: "Error al buscar empleados", datos: err})
    })

})

// Obtener un unico empleado
router.get("/:id", (req,res) =>{

    Empleado.findById(req.params.id).
    then(empleadoRetornado =>{
        res.json({error: false, datos: empleadoRetornado});
    })
    .catch(err =>{
        res.json({error: true, mensaje: "Error al buscar el empleado pedido", datos: err})
    })

})

//Por orden las funciones deberian ir en otro lugar pero esta se queda aqui ya que es solo una.
// por el momento se descarta la función y se guarda un array de _ids
let detallesVacunasFunc = (arregloVacunasEnviado) => { 

    let arregloPromesas = []
    for (idVacunaActual of arregloVacunasEnviado){
        arregloPromesas.push(Vacuna.findOne({_id: idVacunaActual},{_id:1,cantidadAplicar:1}).exec())
    }

    return(Promise.all(arregloPromesas))

}


// Agregar empleados
router.post("/", (req,res) =>{

    let area = null;

    if (req.body.tipoTrabajador){
        area = "Empleado salud"
    }else{
        area = "Empleado normal"
    }

    let detallesVacunasGuar  = detallesVacunasFunc(req.body.detallesVacunacion);

    detallesVacunasGuar.then(arregloRetornado =>{

        const usuario = new Empleado({
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
            registradoPor : req.session.datos.id,
            detallesVacunacion : arregloRetornado
        }, (err) => {
            if (err) res.json({error: true, mensaje: "Ya existe un usuario con esa informacion"});
        })
    
        usuario.save().
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
                detallesVacunacion : req.body.detallesVacunacion}},{new:true})
    .then(empleadoActualizado =>{
        res.json({error: false, mensaje: "Se actualizo la informacion del empleado con exito", datos: empleadoActualizado})
    })
    .catch(err =>{
        res.json({error: true, mensaje: "Error al actualizar la informacion del empleado", datos: err})    
    })

})

//Eliminar empleados
router.delete("/:id", (req, res) => {
    let empleadoId = req.params.id;
    Empleado.findByIdAndRemove(empleadoId)
    .then(trabajador => {
        res.json({error: false, mensaje: "Se eliminó el empleado correctamente"})
    })
    .catch(err =>{
        res.json({error: true, mensaje: "No se pudo eliminar el empleado", datos: err}) 
    })
});


module.exports = router;
