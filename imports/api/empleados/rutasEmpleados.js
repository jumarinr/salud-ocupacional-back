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
        res.json({error: false, datos: empleadosRetornados});
    })
    .catch(err =>{
        res.json({error: true, mensaje: "Error al buscar empleados", datos: err})
    })

})

//Por orden las funciones deberian ir en otro lugar pero esta se queda aqui ya que es solo una.
// por el momento se descarta la función y se guarda un array de _ids
let encontrarVacunas = (arregloVacunasEnviado) => { 

    let arregloVacunas = []
    for (idVacunaActual of arregloVacunasEnviado){
        Vacuna.findOne({_id: idVacunaActual})
        .then(vacunaEncontrada =>{
            arregloVacunas.push(vacunaEncontrada)
        })
        .catch(err =>{
            return [];

        })
    }
    return arregloVacunas;

}

// Agregar empleados
router.post("/", (req,res) =>{

    let area;

    if (req.body.tipoTrabajador){
        area = "Empleado salud"
    }else{
        area = "Empleado normal"
    }
    
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
        //registradoPor : req.body.registradoPor,
        detallesVacunacion : req.body.detallesVacunacion
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

});

//Eliminar empleados
router.delete("/:id", (req, res) => {
    let empleadoId = req.params.id;
    Empleado.findByIdAndRemove(empleadoId).then(trabajador => {
        if(trabajador) {
            res.json({error: false, mensaje: "Se eliminó al empleado correctamente"})
        } else {
            res.json({error: true, mensaje: "No se pudo eliminar al empleado"})
        }
    })
});


module.exports = router;
