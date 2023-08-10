sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../utils/formatter",
    "../utils/constants",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,UIComponent, Fragment, MessageBox, MessageToast, formatter,constants) {
        "use strict";

        return Controller.extend("nba.controller.Detalle", {
            
            formatter: formatter,

            onInit: function () {
                var oRouter=UIComponent.getRouterFor(this);
                oRouter.getRoute("RouteDetalle").attachMatched(this._onMatchedPlayer,this);
            },
            _onMatchedPlayer: function(oEvent){
                var oArgs=oEvent.getParameter("arguments");
                var oView=this.getView();
                oView.bindElement({
                    path:`/JugadoresSet('${oArgs.jugadorId}')`,
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
            onOpenEditPlayer: function(){
                var oView= this.getView();
                if(!this.openEditarJugador){
                    this.openEditarJugador=sap.ui.xmlfragment(constants.model.ids.Fragments.FormDialogEditarJugador, constants.model.routes.Fragments.EditarJugadorDialog, this);
                    oView.addDependent(this.openEditarJugador); 
                }
                this.openEditarJugador.open();
            },
            onCloseEditPlayer:function(){
                this.openEditarJugador.close();
            },
            editPlayer:function(oEvent){
                var oData=this.getView().getModel();
                var bundle=this.getView().getModel("i18n").getResourceBundle();
                var oItem=oEvent.getSource();
                var oPlayer=oItem.getBindingContext().getProperty("JUGADORID");
                var sPath=`/JugadoresSet('${oPlayer}')`;
                var that=this;

                var inputNombreId = Fragment.createId(constants.model.ids.Fragments.FormDialogEditarJugador, "inputNombre");
                var inputApellidoId = Fragment.createId(constants.model.ids.Fragments.FormDialogEditarJugador, "inputApellido");
                var inputPosicionId = Fragment.createId(constants.model.ids.Fragments.FormDialogEditarJugador, "selectPosicion");
                var inputAlturaId = Fragment.createId(constants.model.ids.Fragments.FormDialogEditarJugador, "inputAltura");
                var inputNacimientoId = Fragment.createId(constants.model.ids.Fragments.FormDialogEditarJugador, "datePicker");
                var inputEdadId = Fragment.createId(constants.model.ids.Fragments.FormDialogEditarJugador, "inputEdad");
                var inputNacionalidadId = Fragment.createId(constants.model.ids.Fragments.FormDialogEditarJugador, "inputNacionalidad");
                var inputImagenId = Fragment.createId(constants.model.ids.Fragments.FormDialogEditarJugador, "inputImagen");
                

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
                
                var editPlayer={
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
                        bundle.getText("preguntaEditarJugador"),
                        function(oAction){
                            if(MessageBox.Action.OK===oAction){
                                oData.update(sPath, editPlayer, {
                                    success: function () {
                                        MessageToast.show(bundle.getText("jugadorEditadoExito"))
                                        that.openEditarJugador.close()
                                    },
                                    error: function (error) {
                                        MessageToast.show(bundle.getText("jugadorEditadoError"))
                                        console.log(error)
                                    }
                                });
                                
                            }
                        },
                        bundle.getText("editarJugador")  
                    )
                }else{
                    MessageToast.show(bundle.getText("completarCampos"))
                }        
            }
            
        });
    });
