sap.ui.define([],function(){
    "use strict";
    return{
        model:{
            ids:{
                Fragments:{
                    FormDialogCrearEquipo:"IdFragment",
                    FormDialogEditarEquipo:"IdFragment2",
                    FormDialogEditarJugador:"IdFragment3",
                    FormDialogCrearJugador:"IdFragment4",
                    FormDialogConferenciaPopOver:"IdFragment5",
                    FormDialogMapa:"IdFragment6",
                    FormDialogEliminarMapa:"IdFragment7"
                }
            },
            routes:{
                Fragments: {
                    AgregarJugadorDialog: "nba.view.fragments.agregarJugador",
                    CrearEquipoDialog:"nba.view.fragments.agregarEquipo",
                    EditarEquipoDialog: "nba.view.fragments.editarEquipo",
                    EditarJugadorDialog:"nba.view.fragments.editarJugador",
                    ConferenciaDialog:"nba.view.fragments.conferenciaPopOver",
                    AgregarEquipoMapa:"nba.view.fragments.agregarMapa",
                    EliminarEquipoMapa:"nba.view.fragments.EliminarMapa"
                }
            }
        }
    }
})