sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
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
                    this.openAddMapa=sap.ui.xmlfragment("IdFragment6","nba.view.fragments.agregarMapa",this);
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

               /*  var inputNombreId = Fragment.createId("IdFragment6", "inputNombre"); 
                var inputLatitudId = Fragment.createId("IdFragment6", "inputLatitud");
                var inputLongitudId = Fragment.createId("IdFragment6", "inputLongitud"); */
               

                var nombre = this.getView().byId("inputNombre").getValue();
                var latitud = this.getView().byId("inputLatitud").getValue();
                var longitud = this.getView().byId("inputLongitud").getValue();
               

                var sPath="/DetalleSet";

                var newTeam={
                    "NOMBRE": `${nombre}`,
                    "COORDENADAS": `${longitud};${latitud}`,
                }
                
                if(nombre!=="" && latitud!==""  && longitud!==""){
                    
                    oData.create(sPath, newTeam, {
                        success: function () {
                            MessageToast.show(bundle.getText("equipoAgregadoExito"))
                            that.getView().byId("inputNombre").setValue("");
                            that.getView().byId("inputLatitud").setValue("");
                            that.getView().byId("inputLongitud").setValue("");
                            
                        },
                        error: function (error) {
                            MessageToast.show(bundle.getText("equipoAgregadoError"))
                            console.log(error)
                        }
                    })               
                }else{
                    MessageToast.show(bundle.getText("completarCampos"))
                }
                
            }
        });
    });