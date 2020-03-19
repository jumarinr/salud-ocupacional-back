const mongoose = require("mongoose");

const DetalleVacunacion = require("./detallesVacunacionSchema").model

const Empleado = require("./empleadoSchema");

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
    precio:{
        type: Number
    },
    prestadorServicio: {
        type: String, 
        require: true
    },
})

/*  El siguiente middleware se ejecuta cuando se remueve una vacuna. 
    VacunaSchema.pre() elimina los detallesVacunacion de los empleados que hagan referencia a la vacuna que se está eliminando.
    Primero, busca los empleados que tengan un detalleVacunacion que hagan referencia a la vacuna que se está borrando y se hace
    una proyección de su _id y del detalleVacuna que debe ser borrado.
    Si hay por lo menos un empleado que cumpla con ello, se itera sobre ellos y se extrae el detalle.
    Segundo, se busca el empleado que es dueño del detalleVacunacion a borrar y se procede a borrar el detalleVacunacion con el
    _id del detalle previamente extraido.
    Por último, se actualiza la lista de detallesVacunacion del empleado.
    En el segundo paso se debe buscar nuevamente el empleado, ya que empleadoEncontrado es una proyección, por lo tanto, no es el
    documento "original" de la base de datos, por lo cual no se puede borrar el detalleVacunacion directamente de dicha proyección;
    similarmente ocurre con el detalle extraido de empleadoEncontrado, este detalle no puede ejecutar .remove() directamente, ya que
    no tiene ningún efecto por ser una proyección.
*/

vacunaSchema.pre('remove', function(next){

    Empleado.find(
        {'detallesVacunacion': {$elemMatch: {'vacuna': this._id}}}, 
        {'detallesVacunacion': {$elemMatch: {'vacuna': this._id}}})
        .then(empleadosEncontrados => {

            if (empleadosEncontrados.length > 0){

                for (empleadoEncontrado of empleadosEncontrados){

                    const detalle = empleadoEncontrado.detallesVacunacion[0]

                    Empleado.findById(detalle.parent()._id)
                    .then(empleadoAux => {
                        empleadoAux.detallesVacunacion.id(detalle._id).remove()
                        empleadoAux.save()
                    })
                }
            }
            next();
        })        
})

// Genero el modelo y lo exporto. Con el modelo puedo crear objetos de tipo Vacuna siempre y cuando siga el esquema 

module.exports = mongoose.model("Vacuna", vacunaSchema);