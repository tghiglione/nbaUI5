sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../utils/constants",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/core/date/UI5Date"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, UIComponent, Fragment, MessageBox, MessageToast,constants, Filter, FilterOperator, Sorter,UI5Date) {
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
                var inputNacionalidadId = Fragment.createId(constants.model.ids.Fragments.FormDialogCrearJugador, "inputNacionalidad");
                var inputImagenId = Fragment.createId(constants.model.ids.Fragments.FormDialogCrearJugador, "inputImagen");
                

                var nombre = sap.ui.getCore().byId(inputNombreId).getValue();
                var apellido = sap.ui.getCore().byId(inputApellidoId).getValue();
                var posicion = sap.ui.getCore().byId(inputPosicionId).getSelectedItem().getText();
                var altura = parseInt(sap.ui.getCore().byId(inputAlturaId).getValue());
                var nacimiento = sap.ui.getCore().byId(inputNacimientoId).getValue();
                var nacionalidad = sap.ui.getCore().byId(inputNacionalidadId).getValue();
                var imagen = sap.ui.getCore().byId(inputImagenId).getValue();

                let hoy= UI5Date.getInstance();
                let day=(hoy.getDate()).toString().padStart(2,'0'); //para agregar 0 a la izquierda en caso de necesitar
                let month=(hoy.getMonth() +1).toString().padStart(2,'0');
                let year=(hoy.getFullYear()).toString();
                let hoyFormat=year+month+day;
                
                let edad= Math.floor((parseInt(hoyFormat) - parseInt(nacimiento))/10000);
                
                var sPath="/JugadoresSet";

                var newPlayer={
                    "EQUIPOID": `${equipoId}`,
                    "NOMBRE": `${nombre}`,
                    "APELLIDO": `${apellido}`,
                    "POSICION": `${posicion}`,
                    "ALTURA": altura,
                    "NACIMIENTO": `${nacimiento}`,
                    "EDAD": edad,
                    "NACIONALIDAD": `${nacionalidad}`,
                    "IMAGEN": `${imagen}`,
                }
                
                if(nombre!=="" && apellido!==""  && posicion!=="" && altura!=="" && nacimiento!=="" && nacionalidad!==""){
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
            },
            onFilter:function(){
                var bundle=this.getView().getModel("i18n").getResourceBundle();
                const filtrosModel=this.getView().getModel("filtros").getData();
                let filters=[undefined,undefined,undefined]
                let filtro=filtrosModel.PosicionKey;
                let ordenamiento=filtrosModel.SortKey.toUpperCase();
                let agrupamiento=filtrosModel.GroupKey.toUpperCase();
                let list=this.getView().byId("jugadoresTable");
                let binding=list.getBinding("items");
                
                if (filtro.length>0 ) {
                    let filtrado=new Filter({
                        path:"POSICION",
                        operator:FilterOperator.EQ,
                        value1:filtro
                    });
                    filters.splice(0,1,filtrado);
                    binding.filter(filters[0])
                };
                if(ordenamiento.length>0){
                    let orden=new Sorter({
                        path:ordenamiento,
                        descending: true,
                        group:false
                    })
                    filters.splice(1,1,orden);
                    binding.sort(filters[1])
                }
                if(agrupamiento.length>0){     
                    let agrupar=new Sorter({
                        path:agrupamiento,
                        group:true
                    });
                    filters.splice(2,1,agrupar);
                    binding.sort(filters[2])
                }
                if(agrupamiento==="" && ordenamiento==="" && filtro===""){
                    MessageToast.show(bundle.getText("filtroVacio"))
                }  
            },
            onClearFilter:function(){
                const oModel=this.getView().getModel("filtros");
                oModel.setProperty("/PosicionKey","");
                oModel.setProperty("/SortKey","");
                oModel.setProperty("/GroupKey","");     
                let list=this.getView().byId("jugadoresTable");
                let binding=list.getBinding("items");
                binding.filter([])
                binding.sort([])
            },
        });
    });