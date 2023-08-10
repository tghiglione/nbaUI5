sap.ui.define([], function () {
    "use strict";
    return {

        fechaState: function (sNacimiento) {
            var dateFormatInput= sap.ui.core.format.DateFormat.getInstance({
                pattern:"yyyyMMdd"
            });
            var dateFormatOutput = sap.ui.core.format.DateFormat.getInstance({
                pattern: "dd/MM/yyyy"
            });

            var fechaDate = dateFormatInput.parse(sNacimiento);

            var fechaFormateada= dateFormatOutput.format(fechaDate)

            return fechaFormateada
        },

        conferenciaState: function (sConferencia) {
            if(sConferencia==="Este"){
                return 'Success'
            }else{
                return 'Error'
            }
        },
    
    };
});