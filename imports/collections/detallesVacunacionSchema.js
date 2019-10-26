const mongoose = require("mongoose");

const detallesVacunacionSchema = new mongoose.Schema({
    vacuna:{ 
    type: mongoose.Schema.Types.ObjectId,
    require: true
},
/* La cantidad aplicada debe ser de tipo Number. Si es enviada 
como un String, en type poner 'Number' incluyendo las comillas, o 
castear el número antes de ser ingresado a la base de datos.*/
cantidadAplicada: {
    type: Number, 
    default: 0  
},
registradoPor:{
    type: mongoose.Schema.Types.ObjectId,
    default: null 
}
})

module.exports = detallesVacunacionSchema