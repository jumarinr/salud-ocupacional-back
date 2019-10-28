const Vacuna = require("../collections/vacunaSchema");

// Funcion para devolver un arreglo que tiene las promesas de las vacunas solicitadas al crear un empleado
let detallesVacunasFunc = (arregloVacunasEnviado) => {

    let arregloPromesas = []
    for (idVacunaActual of arregloVacunasEnviado){
        arregloPromesas.push(Vacuna.findOne({_id: idVacunaActual},'_id').exec())
    }

    return(Promise.all(arregloPromesas))

}

module.exports = detallesVacunasFunc