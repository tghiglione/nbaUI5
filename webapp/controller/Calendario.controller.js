sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/library",
	"sap/ui/core/Fragment",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/library",
	"sap/m/MessageToast",
	"sap/ui/core/date/UI5Date"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,coreLibrary, Fragment, DateFormat, JSONModel, unifiedLibrary, MessageToast, UI5Date) {
        "use strict";

        return Controller.extend("nba.controller.Calendario", {
            onInit: function() {

                var oModel = new JSONModel();
                oModel.setData({
                        startDate: UI5Date.getInstance("2018", "6", "9"),
                        appointments: [{
                            title: "Meet John Miller",
                            startDate: UI5Date.getInstance("2018", "6", "8", "5", "0"),
                            endDate: UI5Date.getInstance("2018", "6", "8", "6", "0")
                        }, {
                            title: "Discussion of the plan",
                            startDate: UI5Date.getInstance("2018", "6", "8", "6", "0"),
                            endDate: UI5Date.getInstance("2018", "6", "8", "7", "9")
                        }, {
                            title: "Lunch",
                            text: "canteen",
                            startDate: UI5Date.getInstance("2018", "6", "8", "7", "0"),
                            endDate: UI5Date.getInstance("2018", "6", "8", "8", "0")
                        }, {
                            title: "New Product",
                            text: "room 105",
                            icon: "sap-icon://meeting-room",
                            startDate: UI5Date.getInstance("2018", "6", "8", "8", "0"),
                            endDate: UI5Date.getInstance("2018", "6", "8", "9", "0")
                        }, {
                            title: "Team meeting",
                            text: "Regular",
                            icon: "sap-icon://home",
                            startDate: UI5Date.getInstance("2018", "6", "8", "9", "9"),
                            endDate: UI5Date.getInstance("2018", "6", "8", "10", "0")
                        }, {
                            title: "Discussion with clients",
                            text: "Online meeting",
                            icon: "sap-icon://home",
                            startDate: UI5Date.getInstance("2018", "6", "8", "10", "0"),
                            endDate: UI5Date.getInstance("2018", "6", "8", "11", "0")
                        }
                    ]
                });
                this.getView().setModel(oModel);
    
                oModel = new JSONModel();
                oModel.setData({allDay: false});
                this.getView().setModel(oModel, "allDay");
            },
            handleAppointmentSelect: function (oEvent) {
                var oAppointment = oEvent.getParameter("appointment"),
                    oStartDate,
                    oEndDate,
                    oTrimmedStartDate,
                    oTrimmedEndDate,
                    bAllDate,
                    oModel,
                    oView = this.getView();
    
                if ((!oAppointment || !oAppointment.getSelected()) && this._pDetailsPopover){
                    this._pDetailsPopover.then(function(oResponsivePopover){
                        oResponsivePopover.close();
                    });
                    return;
                }
    
                oStartDate = oAppointment.getStartDate();
                oEndDate = oAppointment.getEndDate();
                oTrimmedStartDate = UI5Date.getInstance(oStartDate);
                oTrimmedEndDate = UI5Date.getInstance(oEndDate);
                bAllDate = false;
                oModel = this.getView().getModel("allDay");
    
                this._setHoursToZero(oTrimmedStartDate);
                this._setHoursToZero(oTrimmedEndDate);
    
                if (oStartDate.getTime() === oTrimmedStartDate.getTime() && oEndDate.getTime() === oTrimmedEndDate.getTime()) {
                    bAllDate = true;
                }
    
                oModel.getData().allDay = bAllDate;
                oModel.updateBindings();
    
                if (!this._pDetailsPopover) {
                    this._pDetailsPopover = Fragment.load({
                        id: oView.getId(),
                        name: "nba.view.fragments.PopoverCal",
                        controller: this
                    }).then(function(oDetailsPopover){
                        oView.addDependent(oDetailsPopover);
                        return oDetailsPopover;
                    });
                }
                this._pDetailsPopover.then(function(oDetailsPopover){
                    oDetailsPopover.setBindingContext(oAppointment.getBindingContext());
                    oDetailsPopover.openBy(oAppointment);
                });
            },
    
            handleEditButton: function () {
                // The sap.m.Popover has to be closed before the sap.m.Dialog gets opened
                var oDetailsPopover = this.byId("detailsPopover");
                oDetailsPopover.close();
                this.sPath = oDetailsPopover.getBindingContext().getPath();
                this._arrangeDialogFragment("Edit appointment");
            },
    
            handlePopoverDeleteButton: function () {
                var oModel = this.getView().getModel(),
                    oAppointments = oModel.getData().appointments,
                    oDetailsPopover = this.byId("detailsPopover"),
                    oAppointment = oDetailsPopover._getBindingContext().getObject();
    
                oDetailsPopover.close();
    
                oAppointments.splice(oAppointments.indexOf(oAppointment), 1);
                oModel.updateBindings();
            },
    
            _arrangeDialogFragment: function (sTitle) {
                var oView = this.getView();
    
                if (!this._pNewAppointmentDialog) {
                    this._pNewAppointmentDialog = Fragment.load({
                        id: oView.getId(),
                        name: "nba.view.fragments.CrearCalendario",
                        controller: this
                    }).then(function(oModifyDialog){
                        oView.addDependent(oModifyDialog);
                        return oModifyDialog;
                    });
                }
    
                this._pNewAppointmentDialog.then(function(oModifyDialog){
                    this._arrangeDialog(sTitle, oModifyDialog);
                }.bind(this));
            },
    
            _arrangeDialog: function (sTitle, oModifyDialog) {
                this._setValuesToDialogContent();
                oModifyDialog.setTitle(sTitle);
                oModifyDialog.open();
            },
    
            _setValuesToDialogContent: function () {
                var bAllDayAppointment = (this.byId("allDay")).getSelected(),
                    sStartDatePickerID = bAllDayAppointment ? "DPStartDate" : "DTPStartDate",
                    sEndDatePickerID = bAllDayAppointment ? "DPEndDate" : "DTPEndDate",
                    oTitleControl = this.byId("appTitle"),
                    oTextControl = this.byId("moreInfo"),
                    oTypeControl = this.byId("appType"),
                    oStartDateControl = this.byId(sStartDatePickerID),
                    oEndDateControl = this.byId(sEndDatePickerID),
                    oContext,
                    oContextObject,
                    oSPCStartDate,
                    sTitle,
                    sText,
                    oStartDate,
                    oEndDate
                    
    
    
                if (this.sPath) {
                    oContext = this.byId("detailsPopover").getBindingContext();
                    oContextObject = oContext.getObject();
                    sTitle = oContextObject.title;
                    sText = oContextObject.text;
                    oStartDate = oContextObject.startDate;
                    oEndDate = oContextObject.endDate;
                    
                } else {
                    sTitle = "";
                    sText = "";
                    oSPCStartDate = this.getView().byId("SPC1").getStartDate();
                    oStartDate = UI5Date.getInstance(oSPCStartDate);
                    oStartDate.setHours(this._getDefaultAppointmentStartHour());
                    oEndDate = UI5Date.getInstance(oSPCStartDate);
                    oEndDate.setHours(this._getDefaultAppointmentEndHour());
                    
                }
    
                oTitleControl.setValue(sTitle);
                oTextControl.setValue(sText);
                oStartDateControl.setDateValue(oStartDate);
                oEndDateControl.setDateValue(oEndDate);
                
            },
    
            handleDialogOkButton: function () {
                var bAllDayAppointment = (this.byId("allDay")).getSelected(),
                    sStartDate = bAllDayAppointment ? "DPStartDate" : "DTPStartDate",
                    sEndDate = bAllDayAppointment ? "DPEndDate" : "DTPEndDate",
                    sTitle = this.byId("appTitle").getValue(),
                    sText = this.byId("moreInfo").getValue(),
                    oStartDate = this.byId(sStartDate).getDateValue(),
                    oEndDate = this.byId(sEndDate).getDateValue(),
                    oModel = this.getView().getModel(),
                    sAppointmentPath;
    
                if (this.byId(sStartDate).getValueState() !== "Error"
                    && this.byId(sEndDate).getValueState() !== "Error") {
    
                    if (this.sPath) {
                        sAppointmentPath = this.sPath;
                        oModel.setProperty(sAppointmentPath + "/title", sTitle);
                        oModel.setProperty(sAppointmentPath + "/text", sText);
                        oModel.setProperty(sAppointmentPath + "/startDate", oStartDate);
                        oModel.setProperty(sAppointmentPath + "/endDate", oEndDate);
                    } else {
                        oModel.getData().appointments.push({
                            title: sTitle,
                            text: sText,
                            startDate: oStartDate,
                            endDate: oEndDate
                        });
                    }
    
                    oModel.updateBindings();
    
                    this.byId("modifyDialog").close();
                }
            },
    
            formatDate: function (oDate) {
                if (oDate) {
                    var iHours = oDate.getHours(),
                    iMinutes = oDate.getMinutes(),
                    iSeconds = oDate.getSeconds();
    
                    if (iHours !== 0 || iMinutes !== 0 || iSeconds !== 0) {
                        return DateFormat.getDateTimeInstance({ style: "medium" }).format(oDate);
                    } else  {
                        return DateFormat.getDateInstance({ style: "medium" }).format(oDate);
                    }
                }
                return "";
            },
    
            handleDialogCancelButton:  function () {
                this.sPath = null;
                this.byId("modifyDialog").close();
            },
    
            handleCheckBoxSelect: function (oEvent) {
                var bSelected = oEvent.getSource().getSelected(),
                    sStartDatePickerID = bSelected ? "DTPStartDate" : "DPStartDate",
                    sEndDatePickerID = bSelected ? "DTPEndDate" : "DPEndDate",
                    oOldStartDate = this.byId(sStartDatePickerID).getDateValue(),
                    oNewStartDate = UI5Date.getInstance(oOldStartDate),
                    oOldEndDate = this.byId(sEndDatePickerID).getDateValue(),
                    oNewEndDate = UI5Date.getInstance(oOldEndDate);
    
                if (!bSelected) {
                    oNewStartDate.setHours(this._getDefaultAppointmentStartHour());
                    oNewEndDate.setHours(this._getDefaultAppointmentEndHour());
                } else {
                    this._setHoursToZero(oNewStartDate);
                    this._setHoursToZero(oNewEndDate);
                }
    
                sStartDatePickerID = !bSelected ? "DTPStartDate" : "DPStartDate";
                sEndDatePickerID = !bSelected ? "DTPEndDate" : "DPEndDate";
                this.byId(sStartDatePickerID).setDateValue(oNewStartDate);
                this.byId(sEndDatePickerID).setDateValue(oNewEndDate);
            },
    
            _getDefaultAppointmentStartHour: function() {
                return 9;
            },
    
            _getDefaultAppointmentEndHour: function() {
                return 10;
            },
    
            _setHoursToZero: function (oDate) {
                oDate.setHours(0, 0, 0, 0);
            },
    
            handleAppointmentCreate: function () {
                this._createInitialDialogValues(this.getView().byId("SPC1").getStartDate());
            },
    
            handleHeaderDateSelect: function (oEvent) {
                this._createInitialDialogValues(oEvent.getParameter("date"));
            },
    
            _createInitialDialogValues: function (oDate) {
                var oStartDate = UI5Date.getInstance(oDate),
                    oEndDate = UI5Date.getInstance(oStartDate);
    
                oStartDate.setHours(this._getDefaultAppointmentStartHour());
                oEndDate.setHours(this._getDefaultAppointmentEndHour());
                this.sPath = null;
    
                this._arrangeDialogFragment("Create appointment");
            },
    
            handleStartDateChange: function (oEvent) {
                var oStartDate = oEvent.getParameter("date");
                MessageToast.show("'startDateChange' event fired.\n\nNew start date is "  + oStartDate.toString());
            },
    
            updateButtonEnabledState: function (oDateTimePickerStart, oDateTimePickerEnd, oButton) {
                var bEnabled = oDateTimePickerStart.getValueState() !== "Error"
                    && oDateTimePickerStart.getValue() !== ""
                    && oDateTimePickerEnd.getValue() !== ""
                    && oDateTimePickerEnd.getValueState() !== "Error";
    
                oButton.setEnabled(bEnabled);
            },
    
            handleDateTimePickerChange: function() {
                var oDateTimePickerStart = this.byId("DTPStartDate"),
                    oDateTimePickerEnd = this.byId("DTPEndDate"),
                    oStartDate = oDateTimePickerStart.getDateValue(),
                    oEndDate = oDateTimePickerEnd.getDateValue(),
                    bEndDateBiggerThanStartDate = oEndDate.getTime() <= oStartDate.getTime(),
                    bErrorState = oStartDate && oEndDate && bEndDateBiggerThanStartDate;
    
                this._setDateValueState(oDateTimePickerStart, bErrorState);
                this._setDateValueState(oDateTimePickerEnd, bErrorState);
                this.updateButtonEnabledState(oDateTimePickerStart, oDateTimePickerEnd, this.byId("modifyDialog").getBeginButton());
            },
    
            handleDatePickerChange: function () {
                var oDatePickerStart = this.byId("DPStartDate"),
                    oDatePickerEnd = this.byId("DPEndDate"),
                    oStartDate = oDatePickerStart.getDateValue(),
                    oEndDate = oDatePickerEnd.getDateValue(),
                    bEndDateBiggerThanStartDate = oEndDate.getTime() < oStartDate.getTime(),
                    bErrorState = oStartDate && oEndDate && bEndDateBiggerThanStartDate;
    
                this._setDateValueState(oDatePickerStart, bErrorState);
                this._setDateValueState(oDatePickerEnd, bErrorState);
                this.updateButtonEnabledState(oDatePickerStart, oDatePickerEnd, this.byId("modifyDialog").getBeginButton());
            },
    
            _setDateValueState: function(oPicker, bErrorState) {
                var sValueStateText = "Start date should be before End date";
    
                if (bErrorState) {
                    oPicker.setValueState(ValueState.Error);
                    oPicker.setValueStateText(sValueStateText);
                } else {
                    oPicker.setValueState(ValueState.None);
                }
            }
            
        });
    });
