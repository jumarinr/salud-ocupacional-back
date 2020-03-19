const mongoose = require("mongoose");
const aplicacionesSchema = require("./aplicacionesSchema.js").schema

const detallesVacunacionSchema = new mongoose.Schema({
    vacuna:{ 
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: "Vacuna"
    },
    /* La cantidad aplicada debe ser de tipo Number. Si es enviada 
    como un String, en type poner 'Number' incluyendo las comillas, o 
    castear el número antes de ser ingresado a la base de datos.*/
    cantidadAplicada: {
        type: Number, 
        default: 0  
    },
    aplicaciones: {
        type: [aplicacionesSchema],
        default: []
    },
    registradoPor:{
        type: mongoose.Schema.Types.ObjectId,
        default: null 
    }
})

// Con el esquema "schema" puedo identificar a los tipos de dato u objetos "detallesVacunacionSchema", mientras que con el modelo "model", puedo crear estos objetos
module.exports = {"schema":detallesVacunacionSchema,"model":mongoose.model("DetalleVacunacion", detallesVacunacionSchema)}