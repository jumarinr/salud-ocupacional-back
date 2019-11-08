 // Requires de paquetes-modulos instalados mediante npm
const express = require("express")
const bodyParser = require("body-parser")
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);

const cors = require('cors')


// Requires de modulos diseñados por los desarrolladores
require('../imports/configurations/db-connection');
const rutasVacunas = require("../imports/api/vacunas/rutasVacunas");
const rutasEmpleados = require("../imports/api/empleados/rutasEmpleados");
const rutasLogin = require("../imports/api/login/rutasLogin");


// Inicia el servidor de express
const app = express();


/* Permite que heroku u otro host configure el puerto segun le parezca. En caso de que no se este desplegando la app,
el puerto sera asignado a 4000 */
const puerto = process.env.PORT || 4000;


/* Para usar cors */
app.use(cors())


// Es necesario situar el bodyParser como un middleware para poder recibir los datos enviados por el metodo POST 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// ---- SESSION ------//
// Pemite user la session en los req de las rutas
app.use(session({
  resave: false,
  saveUninitialized: false,  
  secret: "La cerda esta en la pocilga"// Importante para que la session tenga un hash unico basado en este string
}))


// Middleware para comprobar que haya una session.
// Si no la hay se agregare un false.
app.use((req,res,next) =>{
  if (typeof req.session.datos === 'undefined'){
    req.session.datos = false
  }
  res.set("Session", JSON.stringify(req.session.datos))
  // console.log(req.session)
  // if ((req.originalUrl == "/login" && req.method == "DELETE" && !req.session.datos) || (req.originalUrl != "/login" && !req.session.datos)){
  //  return res.status(405).json({error: true, mensaje: "No se ha iniciado sesion por lo que no se puede completar la operacion que desea"})
  // }
  next()
})


// ---- RUTAS ------//
// Las rutas deben estar separadas en la correspondiente carpeta Rutas para facil mantenibilidad.
app.use("/vacunas", rutasVacunas);
app.use("/empleados", rutasEmpleados);
app.use("/login", rutasLogin);


// Ruta a la pagina de inicio.
//app.get("/", (req,res) =>{
  //  res.send("Bienvenido. Esta conectado")
//})


// El servidor actualmente escucha en el puerto port.
app.listen(puerto,() =>{
    console.log(`Escuchando en el puerto ${puerto}`)
});