const express = require("express");
const cors = require('cors');

const router = express.Router();
router.use(cors());


const Vacuna = require("../../collections/vacunaSchema");


router.get('/', async (req,res) => {
    const vacunas = await Vacuna.find();
    res.json(vacunas);
})


router.post("/registro", (req,res)=>{
    const datosVacuna = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        periodicidad: req.body.periodicidad,
        cantidadAplicar: req.body.cantidadAplicar,
        prestadorServicio : req.body.prestadorServicio
    }

    Vacuna.findOne({
        nombre : req.body.nombre
    }).then(router => {
        if(!router){
            Vacuna.create(datosVacuna).then(router => {
                res.json({status: true})
            }).catch(err => {
                res.send('error: ' + err)
            })
        }else{
            res.json({ status: false})
        }
    }).catch(err => {
        res.send('error: ' + err)
    })
})

/*router.post("/registro", (req,res) =>{
    const nuevaVacuna = new Vacuna({
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        periodicidad: req.body.periodicidad,
        cantidadAplicar: req.body.cantidadAplicar,
        prestadorServicio : req.body.prestadorServicio
    });
    nuevaVacuna.save((err) =>{
        if (err) console.log("Error al conectarse a la base de datos")
        return;
    })
    res.json({
        status: 'Task has been saved'
    });
   // res.send("Bienvenido a la pagina de vacunas")
})*/

module.exports = router;