sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../utils/formatter",
    "../utils/constants",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet'
 
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,UIComponent, Fragment, MessageBox, MessageToast, formatter, constants, Filter, FilterOperator,exportLibrary,Spreadsheet) {
        "use strict";

        return Controller.extend("nba.controller.Equipos", {

            formatter:formatter,
            

            onInit: function () {
                 
            },
            onFilterConferencia:function(){
                var filters=[];
                const filtrosModel= this.getView().getModel("filtros").getData();
                let conferencia=filtrosModel.ConferenciaKey;
                let nombreEquipo=filtrosModel.NombreKey;
                var equipoFormateado=nombreEquipo.charAt(0).toUpperCase() + nombreEquipo.slice(1).toLowerCase();
                if(nombreEquipo && nombreEquipo.length>0){
                    filters.push(new Filter({
                        path:"NOMBRE",
                        operator:FilterOperator.Contains,
                        value1:equipoFormateado
                    }))
                };
                if(conferencia && conferencia.length>0){
                    filters.push(new Filter({
                        path:"CONFERENCIA",
                        operator:FilterOperator.EQ,
                        value1:conferencia
                    }))
                };
                var list=this.getView().byId("equiposTable");
                var binding=list.getBinding("items");
                binding.filter(filters);
            },
            onClearFilter:function(){
                const filtrosModel= this.getView().getModel("filtros");
                filtrosModel.setProperty("/ConferenciaKey","");
                filtrosModel.setProperty("/NombreKey","");
                var list=this.getView().byId("equiposTable");
                var binding=list.getBinding("items");
                binding.filter([]);

            },
            onTeamPress: function(oEvent){
                var oTeam=oEvent.getSource();
                var oRouter= UIComponent.getRouterFor(this);
                var equipo=oTeam.getBindingContext().getProperty("EQUIPOID");
                oRouter.navTo("RouteJugadores",{
                    equipoId: equipo
                });
            },
            onOpenCrearEquipo:function(){
                var oView=this.getView();
                if(!this.openAgregarEquipo){
                    this.openAgregarEquipo=sap.ui.xmlfragment(constants.model.ids.Fragments.FormDialogCrearEquipo,constants.model.routes.Fragments.CrearEquipoDialog,this);
                    oView.addDependent(this.openAgregarEquipo)
                }
                this.openAgregarEquipo.open();
            },
            onCloseCrearEquipo(){
                this.openAgregarEquipo.close();
            },
            createTeam: function(){
                var oData=this.getView().getModel();
                var bundle=this.getView().getModel("i18n").getResourceBundle();
                var that=this;

                var inputNombreId = Fragment.createId(constants.model.ids.Fragments.FormDialogCrearEquipo, "inputNombre"); 
                var inputCiudadId = Fragment.createId(constants.model.ids.Fragments.FormDialogCrearEquipo, "inputCiudad");
                var inputEstadioId = Fragment.createId(constants.model.ids.Fragments.FormDialogCrearEquipo, "inputEstadio");
                var inputConferenciaId = Fragment.createId(constants.model.ids.Fragments.FormDialogCrearEquipo, "selectConferencia");
                var inputImagenId = Fragment.createId(constants.model.ids.Fragments.FormDialogCrearEquipo, "inputImagen");

                var nombre = sap.ui.getCore().byId(inputNombreId).getValue();
                var ciudad = sap.ui.getCore().byId(inputCiudadId).getValue();
                var estadio = sap.ui.getCore().byId(inputEstadioId).getValue();
                var imagen = sap.ui.getCore().byId(inputImagenId).getValue();
                var conferencia = sap.ui.getCore().byId(inputConferenciaId).getSelectedItem().getText();

                var sPath="/EquiposSet";

                var newTeam={
                    "NOMBRE": `${nombre}`,
                    "CIUDAD": `${ciudad}`,
                    "ESTADIO": `${estadio}`,
                    "CONFERENCIA": `${conferencia}`,
                    "IMAGEN": `${imagen}`
                }
                
                if(nombre!=="" && ciudad!==""  && estadio!=="" && conferencia!==""){
                    MessageBox.confirm(
                        bundle.getText("preguntaAgregarEquipo"),
                        function(oAction){
                            if(MessageBox.Action.OK===oAction){
                                oData.create(sPath, newTeam, {
                                    success: function () {
                                        MessageToast.show(bundle.getText("equipoAgregadoExito"))
                                        sap.ui.getCore().byId(inputNombreId).setValue("");
                                        sap.ui.getCore().byId(inputCiudadId).setValue("");
                                        sap.ui.getCore().byId(inputEstadioId).setValue("");
                                        sap.ui.getCore().byId(inputImagenId).setValue("");
                                        that.openAgregarEquipo.close()
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
            deleteTeam: async function(){
                try {
                    var oModel= this.getView().getModel();
                    var bundle=this.getView().getModel("i18n").getResourceBundle();
                    var tabla=this.byId("equiposTable");
                    var oTeam=tabla.getSelectedItem().getBindingContext().getObject(); 
                    var sPath=`/EquiposSet('${oTeam.EQUIPOID}')`;
                    MessageBox.confirm(
                        bundle.getText("preguntaEliminarEquipo"),
                        async function(oAction){
                            if(MessageBox.Action.OK===oAction){
                                const modelo= await new Promise((res,rej)=>{
                                    oModel.read("/EquiposSet('" + oTeam.EQUIPOID + "')/To_Jugadores", {
                                        success: function(data) {
                                            res(data)  
                                        },
                                        error:function(error){
                                            rej(error)
                                        }
                                    })  
                                });
                                const aPlayers=modelo.results;
                                //eliminar jugadores 1 x 1
                                for (const oPlayer of aPlayers){
                                    await new Promise((resolve,reject)=>{
                                        oModel.remove(`/JugadoresSet('${oPlayer.JUGADORID}')`, {
                                            success: function() {
                                                resolve();
                                            },
                                            error: function(error) {
                                                console.log(error)
                                                reject(error)
                                            }
                                        });
                                    })
                                };
                                //eliminar equipo
                                await new Promise((resolve,reject)=>{
                                    oModel.remove(sPath, {
                                        success: function() {
                                            MessageToast.show(bundle.getText("equipoEliminadoExito"));
                                            resolve();
                                        },
                                        error: function(error) {
                                            MessageToast.show(bundle.getText("equipoEliminadoError"));
                                            reject(error)
                                        }
                                    });
                                })
                            }
                        },
                        bundle.getText("eliminarEquipo") 
                    )
                } catch (error) {
                      console.log(error)  
                }  
            },
            openConferenciaPopOver: function (oEvent) {
                var oButton = oEvent.getSource();
                var oView = this.getView();
                
                if(!this.conferenciaPopOver){
                    this.conferenciaPopOver=sap.ui.xmlfragment(constants.model.ids.Fragments.FormDialogConferenciaPopOver,constants.model.routes.Fragments.ConferenciaDialog,this);
                    oView.addDependent(this.conferenciaPopOver)
                }
                var oModel= this.getView().getModel();
                oModel.read("/EquiposSet", {
                    success: function(data) {
                        var sEquipos=data.results;
                        var contadorEste=0;
                        var contadorOeste=0;
                        var contador=0;
                        for(const oEquipo of sEquipos){
                            contador++;
                            if (oEquipo.CONFERENCIA==="Este") {
                                contadorEste++;    
                            } else if(oEquipo.CONFERENCIA==="Oeste"){
                                contadorOeste++;
                            }
                        }
                        var porcentajeEste= (contadorEste * 100 )/ contador;
                        var porcentajeOeste= (contadorOeste * 100) / contador;
                        var segmentoEste = Fragment.createId(constants.model.ids.Fragments.FormDialogConferenciaPopOver, "segmentoEste"); 
                        var segmentoOeste = Fragment.createId(constants.model.ids.Fragments.FormDialogConferenciaPopOver, "segmentoOeste");
                        var sEste = sap.ui.getCore().byId(segmentoEste)
                        var sOeste = sap.ui.getCore().byId(segmentoOeste)
                        sEste.setValue(porcentajeEste);
                        sOeste.setValue(porcentajeOeste);                        
                        sEste.setDisplayedValue(`${porcentajeEste}`)
                        sOeste.setDisplayedValue(`${porcentajeOeste}`)
                         
                    },
                    error:function(error){
                        console.log(error)
                    } 
                })  
                this.conferenciaPopOver.openBy(oButton);
            },
            closePopOver: function () {
                this.conferenciaPopOver.close();
            },
            createColumnConfig: function() {

                var EdmType = exportLibrary.EdmType;

                return [
                    {
                       label: 'NOMBRE',
                        property: 'NOMBRE',
                        type: EdmType.String
                    },
                    {
                        label: 'CIUDAD',
                        property: 'CIUDAD',
                        type: EdmType.String
                    },
                    {
                        label: 'ESTADIO',
                        property: 'ESTADIO',
                        type: EdmType.String
                    },
                    {
                        label: 'CONFERENCIA',
                        property: 'CONFERENCIA',
                        type: EdmType.String
                    }];
            },
            onExportList:function(){
                let bundle=this.getView().getModel("i18n").getResourceBundle();
                let oTable = this.getView().byId('equiposTable');
                let oBinding = oTable.getBinding('items');
                let aCols = this.createColumnConfig();

                let oSettings = {
                    workbook: { columns: aCols },
                    dataSource: oBinding
                };

                let oSheet = new Spreadsheet(oSettings);
                oSheet.build()
                    .then(function() {
                        MessageToast.show(bundle.getText("descargaExitosa"));
                    }).finally(function() {
                        oSheet.destroy();
                    });
            },
        });
    });
