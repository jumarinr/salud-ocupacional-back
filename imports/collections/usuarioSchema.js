const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
    tipoIdentificacion:{
        type: String,
        require: true,
        enum: {values: ["cc","tp"]} // Son los unicos valores que va a recibir el tipoIdentificacion */ 
    },
    identificacion:{
        type: String,
        require: true,
        unique: true
    },
    correo:{
        type: String,
        require: true,
        unique: true,
        match: /.+@.+/ // RegExp
    },
    nombres: {
        type: String,
        require: true
    },
    apellidos:{
        type: String,
        require: true
    },
    fechaNacimiento:{
        type: Date,
        require: true,
        min: Date(1939,01,01),
        max: Date(2000,12,29)
    },
    direccion:{
        type: String,
        require: true
    },
    telefono:{
        type: String,
        require: true
    },
    celular:{
        type: String
        //Dato Opcional
    },
    contactoAllegado:{
        type: String,
        require: true
    },
    nivelRiesgoLabolar:{
        type: String,
        require: true,
    },
    areaTrabajo:{
        type: String,
        default: "Empleado normal"
        /* Dato por defecto porque si no señala la opcion de que el trabajador se desempeña
        en la area de salud, entonces significa que es un empleado normal (REVISAR) */
    },
    registradoPor:{
        type: Object,
        default: null
    },
    detallesVacunacion:{
        type: Array,
        default: []
    }
});

const Usuario = mongoose.model("Empleado", usuarioSchema);

module.exports = Usuario