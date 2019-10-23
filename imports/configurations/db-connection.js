 const mongoose = require("mongoose")

// Conexion a la base de datos. (Se puede mejorar en un futuro capturando y tratando el error de una mejor manera)

mongoose.connect("mongodb://dev1:contrasena1@ds229068.mlab.com:29068/requi-sistemas-salud-ocupacional", {useNewUrlParser: true, useUnifiedTopology: true}).then(
    db => console.log("DB conectada")).catch(err => console.error(err));