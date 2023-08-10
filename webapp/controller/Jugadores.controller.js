sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../utils/constants",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, UIComponent, Fragment, MessageBox, MessageToast,constants) {
        "use strict";

        return Controller.extend("nba.controller.Jugadores", {
            onInit: function () {
                var oRouter= UIComponent.getRouterFor(this);
                oRouter.getRoute("RouteJugadores").attachMatched(this._onMatched,this); 
            },
            _onMatched: function(oEvent){
                var oArgs = oEvent.getParameter("arguments");
                var oView=this.getView();
                oView.bindElement({
                    path:`/EquiposSet('${oArgs.equipoId}')`,
                    events:{
                        dataRequested: function () {
                            oView.setBusy(true);
                        },
                        dataReceived: function () {
                            oView.setBusy(false);
                        }
                    }
                })
            },
            onListItemPress: function(oEvent){
                var oPlayer= oEvent.getSource();
                var oRouter=UIComponent.getRouterFor(this);
                var jugador=oPlayer.getBindingContext().getProperty("JUGADORID");
                oRouter.navTo("RouteDetalle",{
                    jugadorId: jugador
                })
            },
            onOpenDialog: function(){
                var oView= this.getView();
                if(!this.openDialog){
                    this.openDialog=sap.ui.xmlfragment(constants.model.ids.Fragments.FormDialogCrearJugador,constants.model.routes.Fragments.AgregarJugadorDialog, this);
                    oView.addDependent(this.openDialog); 
                }
                this.openDialog.open();
            },
            
            onCloseDialog:function(){
                this.openDialog.close();
            },
            createPlayer: function(oEvent){
                var oData=this.getView().getModel();
                var bundle=this.getView().getModel('i18n').getResourceBundle();
                var equipoId= oEvent.getSource().getBindingContext().getProperty("EQUIPOID");
                var that=this;

                var inputNombreId = Fragment.createId(constants.model.ids.Fragments.FormDialogCrearJugador, "inputNombre"); 
                var inputApellidoId = Fragment.createId(constants.model.ids.Fragments.FormDialogCrearJugador, "inputApellido");
                var inputPosicionId = Fragment.createId(constants.model.ids.Fragments.FormDialogCrearJugador, "selectPosicion");
                var inputAlturaId = Fragment.createId(constants.model.ids.Fragments.FormDialogCrearJugador, "inputAltura");
                var inputNacimientoId = Fragment.createId(constants.model.ids.Fragments.FormDialogCrearJugador, "datePicker");
                var inputEdadId = Fragment.createId(constants.model.ids.Fragments.FormDialogCrearJugador, "inputEdad");
                var inputNacionalidadId = Fragment.createId(constants.model.ids.Fragments.FormDialogCrearJugador, "inputNacionalidad");
                var inputImagenId = Fragment.createId(constants.model.ids.Fragments.FormDialogCrearJugador, "inputImagen");
                

                var nombre = sap.ui.getCore().byId(inputNombreId).getValue();
                var apellido = sap.ui.getCore().byId(inputApellidoId).getValue();
                var posicion = sap.ui.getCore().byId(inputPosicionId).getSelectedItem().getText();
                var altura = parseInt(sap.ui.getCore().byId(inputAlturaId).getValue());
                var nacimiento = sap.ui.getCore().byId(inputNacimientoId).getValue();
                var edad = parseInt(sap.ui.getCore().byId(inputEdadId).getValue());
                var nacionalidad = sap.ui.getCore().byId(inputNacionalidadId).getValue();
                var imagen = sap.ui.getCore().byId(inputImagenId).getValue();

                var nombreFormateado = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
                var apellidoFormateado = apellido.charAt(0).toUpperCase() + apellido.slice(1).toLowerCase();
                
                var sPath="/JugadoresSet";

                var newPlayer={
                    "EQUIPOID": `${equipoId}`,
                    "NOMBRE": `${nombreFormateado}`,
                    "APELLIDO": `${apellidoFormateado}`,
                    "POSICION": `${posicion}`,
                    "ALTURA": altura,
                    "NACIMIENTO": `${nacimiento}`,
                    "EDAD": edad,
                    "NACIONALIDAD": `${nacionalidad}`,
                    "IMAGEN": `${imagen}`,
                }
                
                if(nombre!=="" && apellido!==""  && posicion!=="" && altura!=="" && nacimiento!=="" && edad!=="" && nacionalidad!==""){
                    MessageBox.confirm(
                        bundle.getText("preguntaAgregarJugador"),
                        function(oAction){
                            if(MessageBox.Action.OK===oAction){
                                oData.create(sPath, newPlayer, {
                                    success: function () {
                                        MessageToast.show(bundle.getText("jugadorAgregadoExito"))
                                        sap.ui.getCore().byId(inputNombreId).setValue("");
                                        sap.ui.getCore().byId(inputApellidoId).setValue("");
                                        sap.ui.getCore().byId(inputAlturaId).setValue("");
                                        sap.ui.getCore().byId(inputNacimientoId).setValue("");
                                        sap.ui.getCore().byId(inputEdadId).setValue("");
                                        sap.ui.getCore().byId(inputNacionalidadId).setValue("");
                                        sap.ui.getCore().byId(inputImagenId).setValue("");
                                        that.openDialog.close()
                                    },
                                    error: function (error) {
                                        MessageToast.show(bundle.getText("jugadorAgregadoError"))
                                        console.log(error)
                                    }
                                });
                                
                            }
                        },
                        bundle.getText("agregarJugador")
                    )
                }else{
                    MessageToast.show(bundle.getText("completarCampos"))
                }
            },
            deletePlayer: function(oEvent){
                var oData= this.getView().getModel();
                var bundle=this.getView().getModel("i18n").getResourceBundle();
                var oItem=oEvent.getSource();
                var oPlayer=oItem.getBindingContext().getProperty("JUGADORID");
                var sPath=`/JugadoresSet('${oPlayer}')`;
                MessageBox.confirm(
                    bundle.getText("preguntaEliminarJugador"),
                    function(oAction){
                        if(MessageBox.Action.OK===oAction){
                            oData.remove(sPath,{
                                success: function () {
                                    MessageToast.show("jugadorEliminadoExito")
                                },
                                error: function (oError) {
                                    MessageToast.show("jugadorEliminadoError")
                                    console.log(oError)
                                }       
                            });
                            
                        }
                    },
                    bundle.getText("eliminarJugador")
                )  
            },
            openEditEquipo:function(){
                var oView= this.getView();
                if(!this.openEditarEquipo){
                    this.openEditarEquipo=sap.ui.xmlfragment(constants.model.ids.Fragments.FormDialogEditarEquipo, constants.model.routes.Fragments.EditarEquipoDialog, this);
                    oView.addDependent(this.openEditarEquipo); 
                }
                this.openEditarEquipo.open();
            },
            onCloseEditEquipo:function(){
                this.openEditarEquipo.close();
            },
            editEquipo:function(oEvent){
                var oData=this.getView().getModel();
                var bundle=this.getView().getModel("i18n").getResourceBundle();
                var oItem=oEvent.getSource();
                var oTeam=oItem.getBindingContext().getProperty("EQUIPOID");
                var sPath=`/EquiposSet('${oTeam}')`;
                var that=this;

                var inputNombreId = Fragment.createId(constants.model.ids.Fragments.FormDialogEditarEquipo, "inputNombre");
                var inputCiudadId = Fragment.createId(constants.model.ids.Fragments.FormDialogEditarEquipo, "inputCiudad");
                var inputEstadioId = Fragment.createId(constants.model.ids.Fragments.FormDialogEditarEquipo, "inputEstadio");
                var inputConferenciaId = Fragment.createId(constants.model.ids.Fragments.FormDialogEditarEquipo, "selectConferencia");
                var inputImagenId = Fragment.createId(constants.model.ids.Fragments.FormDialogEditarEquipo, "inputImagen");

                var nombre = sap.ui.getCore().byId(inputNombreId).getValue();
                var ciudad = sap.ui.getCore().byId(inputCiudadId).getValue();
                var estadio = sap.ui.getCore().byId(inputEstadioId).getValue();
                var imagen = sap.ui.getCore().byId(inputImagenId).getValue();
                var conferencia = sap.ui.getCore().byId(inputConferenciaId).getSelectedItem().getText();

                var editTeam={
                    "NOMBRE": `${nombre}`,
                    "CIUDAD": `${ciudad}`,
                    "ESTADIO": `${estadio}`,
                    "CONFERENCIA": `${conferencia}`,
                    "IMAGEN": `${imagen}`
                }
                
                if(nombre!=="" && ciudad!==""  && estadio!=="" && conferencia!=="" ){
                    MessageBox.confirm(
                        bundle.getText("preguntaEditarEquipo"),
                        function(oAction){
                            if(MessageBox.Action.OK===oAction){
                                oData.update(sPath, editTeam, {
                                    success: function () {
                                        MessageToast.show(bundle.getText("equipoEditadoExito"))
                                        that.openEditarEquipo.close()
                                    },
                                    error: function (error) {
                                        MessageToast.show(bundle.getText("equipoEditadoError"))
                                        console.log(error)
                                    }
                                });
                                
                            }
                        },
                        bundle.getText("editarEquipo")   
                    )
                }else{
                    MessageToast.show(bundle.getText("completarCampos"))
                }               
            }
            
        });
    });