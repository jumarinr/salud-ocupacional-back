 const mongoose = require("mongoose")

// Conexion a la base de datos. 
mongoose.connect(
    // "mongodb://dev1:contrasena1@ds229068.mlab.com:29068/requi-sistemas-salud-ocupacional", 
    "mongodb+srv://dev1:1007223499@requi-sistemas-salud-ocupacional-adpwj.mongodb.net/requi-sistemas-salud-ocupacional?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
.then(db => console.log("Base de datos conectada"))
.catch(err => console.error(err));

