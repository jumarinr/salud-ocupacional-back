const express = require("express");
const cors = require('cors');

const router = express.Router();
router.use(cors());

const Usuario = require("../../collections/usuarioSchema");

const Vacuna = require("../../collections/vacunaSchema");


router.get("/", (req,res)=>{
    console.log(Vacuna.find({}))
    Vacuna.find({},(err, resultado)=>{
        if (err) res.send([])
        else {
            res.json(resultado)
        }
    })
})

//Por orden las funciones deberian ir en otro lugar pero esta se queda aqui ya que es solo una.
let encontrarVacunas = (arregloVacunas) => { 
    let arregloVacuna = []
    for (idVacunaActual of arregloVacunas){
        Vacuna.findOne({_id: idVacunaActual},(err, resultado) => {
            if (err){
                console.log("Hubo un error")
                return "";
            }
            arregloVacuna.push(resultado);
        })
    }
    return arregloVacuna;
}


router.post("/", (req,res) =>{
    let area;
    if (req.body.tipoTrabajador){
        area = "Empleado salud"
    }else{
        area = "Empleado normal"
    }
    const usuario = new Usuario({
        tipoIdentificacion : req.body.tipoDocumento,
        identificacion : req.body.documento,
        correo : req.body.correo,
        nombre : req.body.nombres,
        apellidos : req.body.apellidos,
        fechaNacimiento : req.body.fechaNacimiento,
        direccion : req.body.direccion,
        telefono : req.body.telefono,
        celular : req.body.celular,
        contactoAllegado : req.body.telefonoFamiliar,
        nivelRiesgoLaboral : req.body.nivelRiesgo,
        areaTrabajo : area,
        //registradoPor : req.body.registradoPor,
        detallesVacunacion : encontrarVacunas(req.body.detallesVacunacion)
    }, (err) =>{
        if (err) {
            res.json({status: false});
        }
    })
    usuario.save((err) => {
        if (err) res.json({status: false});
        res.json({status: true})
    })
});


module.exports = router;