const mongoose = require("mongoose");

const aplicacionesSchema = new mongoose.Schema({
    fecha:{
        type: Date
    },
    /*Este precio corresponde al precio que tenía la vacuna en el momento en que esta aplicación fue registrada */
    precio:{
        type: Number
    }
})

module.exports = {"schema":aplicacionesSchema,"model":mongoose.model("aplicacionVacuna", aplicacionesSchema)}