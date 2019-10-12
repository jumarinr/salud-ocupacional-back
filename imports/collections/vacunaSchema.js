const mongoose = require("mongoose");

// Crea el esquema para una vacuna (Es como el esqueleto de lo que se pretende guardar en la base de datos)

const vacunaSchema = new mongoose.Schema({
    nombre:{
        type: String, 
        require: true
    },
    descripcion: {
        type: String, 
        require: true
    },
    periodicidad: {
        type: Number,   
        require: true
    },
    cantidadAplicar: {
        type: Number, 
        required: true
    },
    prestadorServicio: {
        type: String, 
        require: true
    },
})

// Genero el modelo y lo exporto. Con el modelo puedo crear objetos de tipo Vacuna siempre y cuando siga el esquema 

module.exports = mongoose.model("Vacuna", vacunaSchema);