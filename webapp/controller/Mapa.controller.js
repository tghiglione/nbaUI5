sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../utils/constants",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,constants,Fragment,MessageBox,MessageToast) {
        "use strict";

        return Controller.extend("nba.controller.Mapa", {
            
            onInit: function () {
               
            },
            openModal:function(){
                var oView=this.getView();
                if(!this.openAddMapa){
                    this.openAddMapa=sap.ui.xmlfragment(constants.model.ids.Fragments.FormDialogMapa,constants.model.routes.Fragments.AgregarEquipoMapa,this);
                    oView.addDependent(this.openAddMapa)
                }
                this.openAddMapa.open();
            },
            onCloseDialog:function(){
                this.openAddMapa.close();
            },
            onAddMapa:function(){
                var oData=this.getView().getModel();
                var bundle=this.getView().getModel("i18n").getResourceBundle();
                var that=this;

                var inputNombreId = Fragment.createId(constants.model.ids.Fragments.FormDialogMapa, "inputNombre"); 
                var inputLatitudId = Fragment.createId(constants.model.ids.Fragments.FormDialogMapa, "inputLatitud");
                var inputLongitudId = Fragment.createId(constants.model.ids.Fragments.FormDialogMapa, "inputLongitud");
               

                var nombre = sap.ui.getCore().byId(inputNombreId).getValue();
                var latitud = sap.ui.getCore().byId(inputLatitudId).getValue();
                var longitud = sap.ui.getCore().byId(inputLongitudId).getValue();
               

                var sPath="/DetalleSet";

                var newTeam={
                    "NOMBRE": `${nombre}`,
                    "COORDENADAS": `${longitud};${latitud}`,
                }
                
                if(nombre!=="" && latitud!==""  && longitud!==""){
                    MessageBox.confirm(
                        bundle.getText("preguntaAgregarEquipo"),
                        function(oAction){
                            if(MessageBox.Action.OK===oAction){
                                oData.create(sPath, newTeam, {
                                    success: function () {
                                        MessageToast.show(bundle.getText("equipoAgregadoExito"))
                                        sap.ui.getCore().byId(inputNombreId).setValue("");
                                        sap.ui.getCore().byId(inputLatitudId).setValue("");
                                        sap.ui.getCore().byId(inputLongitudId).setValue("");
                                        that.openAddMapa.close();
                                    },
                                    error: function (error) {
                                        MessageToast.show(bundle.getText("equipoAgregadoError"))
                                        console.log(error)
                                    }
                                });
                               
                            }
                        },
                        bundle.getText("agregarEquipo") 
                    )              
                }else{
                    MessageToast.show(bundle.getText("completarCampos"))
                }
                
            },
            openDelete:function(){
                var oView=this.getView();
                if(!this.openEliminarMapa){
                    this.openEliminarMapa=sap.ui.xmlfragment(constants.model.ids.Fragments.FormDialogEliminarMapa,constants.model.routes.Fragments.EliminarEquipoMapa,this);
                    oView.addDependent(this.openEliminarMapa)
                }
                this.openEliminarMapa.open();
            },
            onCloseEliminar:function(){
                this.openEliminarMapa.close();
            },
            onDelete:function(){
                var oData=this.getView().getModel();
                var bundle=this.getView().getModel("i18n").getResourceBundle();
                var that=this;

                var inputEquipoId = Fragment.createId(constants.model.ids.Fragments.FormDialogEliminarMapa, "selectEquipo");

                var equipo = sap.ui.getCore().byId(inputEquipoId).getSelectedItem().getBindingContext().getObject();
                var equipoId=equipo.JUGADORID;
            
                var oPath=`/DetalleSet('${equipoId}')`;
                
                MessageBox.confirm(
                    bundle.getText("preguntaEliminarEquipo"),
                    function(oAction){
                        if(MessageBox.Action.OK===oAction){
                            oData.remove(oPath,{
                                success: function () {
                                    that.openEliminarMapa.close();
                                    MessageToast.show(bundle.getText("equipoEliminadoExito"))
                                },
                                error: function (oError) {
                                    MessageToast.show(bundle.getText("equipoEliminadoError"))
                                    console.log(oError)
                                }       
                            });
                            
                        }
                    },
                    bundle.getText("eliminarEquipo")
                )  
            }
        });
    });