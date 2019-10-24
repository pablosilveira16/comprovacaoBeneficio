sap.ui.define([
    "com/blueboot/BeneficioEducacional/Comprobacion/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/BindingMode",
    "sap/ui/core/message/Message",
    "sap/m/MessageToast",
    "sap/ui/core/ValueState",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/format/FileSizeFormat",
    "sap/m/ObjectMarker",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType"
], function(Controller, JSONModel, BindingMode, Message, MessageToast, ValueState, UploadCollectionParameter, FileSizeFormat, ObjectMarker, Filter, FilterOperator, FilterType) {
    "use strict";

    return Controller.extend("com.blueboot.BeneficioEducacional.Comprobacion.controller.Comprobacion", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf com.blueboot.BeneficioEducacional.Comprobacion.view.Comprobacion
         */
        onInit: function() {
            // ---- SAPUI5 MESSAGE POPOVER SAMPLE ----
            var oModel, oView;
            this._initLocalModel();

            oView = this.getView();

            // set message model
            this._messageManager = sap.ui.getCore().getMessageManager();
            oView.setModel(this._messageManager.getMessageModel(), "message");

            // or just do it for the whole view
            this._messageManager.registerObject(oView, true);

            // ---- 

            var oRouter = this.getRouter();
            oRouter.getRoute("comprobacion").attachMatched(this._onRouteMatched, this);
            oView.bindElement("/Beneficio");

            this._wizard = this.byId("wizardComprobacion");

            if (!this._dialogBeneficiario) {
                this._dialogBeneficiario = sap.ui.xmlfragment("com.blueboot.BeneficioEducacional.Comprobacion.view.Beneficiario", this);
                this.getView().addDependent(this._dialogBeneficiario);
            }

            var oModel = this.getModel(),
                aBeneficios = oModel.getProperty("/Beneficios");

            oModel.setProperty("/Dependiente", "julia");
            var sDependiente = oModel.getProperty("/Dependiente");


            oModel.setProperty("/BeneficiosActuales", aBeneficios.filter(function(filtro){
                return filtro.id ==  sDependiente})
            );  

            oModel.setProperty("/BeneficioKey", "julia-3");
            oModel.setProperty("/items", [])
        },

        // --------> UPDATECOLLECTION INICIO <--------

        createObjectMarker: function(sId, oContext) {
            var mSettings = null;

            if (oContext.getProperty("type")) {
                mSettings = {
                    type: "{type}",
                    press: this.onMarkerPress
                };
            }
            return new ObjectMarker(sId, mSettings);
        },

        formatAttribute: function(sValue) {
            if (jQuery.isNumeric(sValue)) {
                return FileSizeFormat.getInstance({
                    binaryFilesize: false,
                    maxFractionDigits: 1,
                    maxIntegerDigits: 3
                }).format(sValue);
            } else {
                return sValue;
            }
        },

        onChange: function(oEvent) {
            var oUploadCollection = oEvent.getSource();
            // Header Token
            var oCustomerHeaderToken = new UploadCollectionParameter({
                name: "x-csrf-token",
                value: "securityTokenFromModel"
            });
            oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
        },

        onFileDeleted: function(oEvent) {
            this.deleteItemById(oEvent.getParameter("documentId"));
            MessageToast.show("FileDeleted event triggered.");
        },

        deleteItemById: function(sItemToDeleteId) {
            var oModel = this.getView().getModel();
            var oData = this.byId("UploadCollection").getModel().getData();
            var aItems = jQuery.extend(true, {}, oData).items;
            jQuery.each(aItems, function(index) {
                if (aItems[index] && aItems[index].documentId === sItemToDeleteId) {
                    aItems.splice(index, 1);
                }
            });
            oModel.setProperty("/items", aItems);
            this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
        },

        deleteMultipleItems: function(aItemsToDelete) {
            var oData = this.byId("UploadCollection").getModel().getData();
            var nItemsToDelete = aItemsToDelete.length;
            var aItems = jQuery.extend(true, {}, oData).items;
            var i = 0;
            jQuery.each(aItems, function(index) {
                if (aItems[index]) {
                    for (i = 0; i < nItemsToDelete; i++) {
                        if (aItems[index].documentId === aItemsToDelete[i].getDocumentId()) {
                            aItems.splice(index, 1);
                        }
                    }
                }
            });
            this.byId("UploadCollection").getModel().setData({
                "items": aItems
            });
            this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
        },

        onFilenameLengthExceed: function() {
            MessageToast.show("FilenameLengthExceed event triggered.");
        },

        onFileRenamed: function(oEvent) {
            var oData = this.byId("UploadCollection").getModel().getData();
            var aItems = jQuery.extend(true, {}, oData).items;
            var sDocumentId = oEvent.getParameter("documentId");
            jQuery.each(aItems, function(index) {
                if (aItems[index] && aItems[index].documentId === sDocumentId) {
                    aItems[index].fileName = oEvent.getParameter("item").getFileName();
                }
            });

            var oModel = this.getView().getModel();
            oModel.setProperty("/items", aItems);
            MessageToast.show("FileRenamed event triggered.");
        },

        onFileSizeExceed: function() {
            MessageToast.show("FileSizeExceed event triggered.");
        },

        onTypeMissmatch: function() {
            MessageToast.show("TypeMissmatch event triggered.");
        },

        onUploadComplete: function(oEvent) {
            var oUploadCollection = this.byId("UploadCollection");
            var oData = oUploadCollection.getModel().getData();

            oData.items.unshift({
                "documentId": jQuery.now().toString(), // generate Id,
                "fileName": oEvent.getParameter("files")[0].fileName,
                "mimeType": "",
                "thumbnailUrl": "",
                "url": "",
                "attributes": [
                    {
                        "title": "Carregada By",
                        "text": "You",
                        "active": false
                    },
                    {
                        "title": "Carregada On",
                        "text": new Date(jQuery.now()).toLocaleDateString(),
                        "active": false
                    },
                    {
                        "title": "File Size",
                        "text": "505000",
                        "active": false
                    }
                ],
                "statuses": [
                    {
                        "title": "",
                        "text": "",
                        "state": "None"
                    }
                ],
                "markers": [
                    {
                    }
                ],
                "selected": false
            });
            this.getView().getModel().refresh();

            // Sets the text to the label
            this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
         

            // delay the success message for to notice onChange message
            setTimeout(function() {
                MessageToast.show("UploadComplete event triggered.");
            }, 4000);
        },

        onBeforeUploadStarts: function(oEvent) {
            // Header Slug
            var oCustomerHeaderSlug = new UploadCollectionParameter({
                name: "slug",
                value: oEvent.getParameter("fileName")
            });
            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        },

        onUploadTerminated: function() {
            /*
            // get parameter file name
            var sFileName = oEvent.getParameter("fileName");
            // get a header parameter (in case no parameter specified, the callback function getHeaderParameter returns all request headers)
            var oRequestHeaders = oEvent.getParameters().getHeaderParameter();
            */
        },

        onFileTypeChange: function(oEvent) {
            this.byId("UploadCollection").setFileType(oEvent.getSource().getSelectedKeys());
        },

        onSelectAllPress: function(oEvent) {
            var oUploadCollection = this.byId("UploadCollection");
            if (!oEvent.getSource().getPressed()) {
                this.deselectAllItems(oUploadCollection);
                oEvent.getSource().setPressed(false);
                oEvent.getSource().setText("Select all");
            } else {
                this.deselectAllItems(oUploadCollection);
                oUploadCollection.selectAll();
                oEvent.getSource().setPressed(true);
                oEvent.getSource().setText("Deselect all");
            }
            this.onSelectionChange(oEvent);
        },

        deselectAllItems: function(oUploadCollection) {
            var aItems = oUploadCollection.getItems();
            for (var i = 0; i < aItems.length; i++) {
                oUploadCollection.setSelectedItem(aItems[i], false);
            }
        },

        getAttachmentTitleText: function() {
            var aItems = this.byId("UploadCollection").getItems();
            return "Carregada (" + aItems.length + ")";
        },

        onModeChange: function(oEvent) {
            var oSettingsModel = this.getView().getModel("settings");
            if (oEvent.getParameters().selectedItem.getProperty("key") === MobileLibrary.ListMode.MultiSelect) {
                oSettingsModel.setProperty("/visibleEdit", false);
                oSettingsModel.setProperty("/visibleDelete", false);
                this.enableToolbarItems(true);
            } else {
                oSettingsModel.setProperty("/visibleEdit", true);
                oSettingsModel.setProperty("/visibleDelete", true);
                this.enableToolbarItems(false);
            }
        },

        enableToolbarItems: function(status) {
            this.byId("selectAllButton").setVisible(status);
            this.byId("deleteSelectedButton").setVisible(status);
            this.byId("selectAllButton").setEnabled(status);
            // This is only enabled if there is a selected item in multi-selection mode
            if (this.byId("UploadCollection").getSelectedItems().length > 0) {
                this.byId("deleteSelectedButton").setEnabled(true);
            }
        },

        onDeleteSelectedItems: function() {
            var aSelectedItems = this.byId("UploadCollection").getSelectedItems();
            this.deleteMultipleItems(aSelectedItems);
            if (this.byId("UploadCollection").getSelectedItems().length < 1) {
                this.byId("selectAllButton").setPressed(false);
                this.byId("selectAllButton").setText("Select all");
            }
            MessageToast.show("Delete selected items button press.");
        },

        onSearch: function(oEvt) {
            var oSelect, oBinding, aFilters, sShipCountry;

            var sFilterValue = oEvt.getParameters().query; // I assume you can get the filter value from somewhere...
            var oUploadCollection = this.getView().byId("UploadCollection"); //get the reference to your Select control
            oBinding = oUploadCollection.getBinding("items");
            aFilters = [];

            if (sFilterValue){
                aFilters.push( new Filter("fileName", FilterOperator.Contains, sFilterValue) );
            }
            oBinding.filter(aFilters, FilterType.Application);  //apply the filter
        },

        onSelectionChange: function() {
            var oUploadCollection = this.byId("UploadCollection");
            // Only it is enabled if there is a selected item in multi-selection mode
            if (oUploadCollection.getMode() === MobileLibrary.ListMode.MultiSelect) {
                if (oUploadCollection.getSelectedItems().length > 0) {
                    this.byId("deleteSelectedButton").setEnabled(true);
                } else {
                    this.byId("deleteSelectedButton").setEnabled(false);
                }
            }
        },

        onAttributePress: function(oEvent) {
            MessageToast.show("Attribute press event - " + oEvent.getSource().getTitle() + ": " + oEvent.getSource().getText());
        },

        onMarkerPress: function(oEvent) {
            MessageToast.show("Marker press event - " + oEvent.getSource().getType());
        },

        onOpenAppSettings: function(oEvent) {
            if (!this.oSettingsDialog) {
                this.oSettingsDialog = sap.ui.xmlfragment("sap.m.sample.UploadCollection.AppSettings", this);
                this.getView().addDependent(this.oSettingsDialog);
            }
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oSettingsDialog);
            this.oSettingsDialog.open();
        },

        // --------> UPDATECOLLECTION FIN <--------

        _onRouteMatched: function(oEvent) {
            var oModel = this.getModel(),
                oBeneficio = {};


            oModel.setProperty("/Beneficio", oBeneficio);
            this._dialogBeneficiario.open();
        },


        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf com.blueboot.BeneficioEducacional.Comprobacion.view.Comprobacion
         */
        //  onBeforeRendering: function() {
        //
        //  },

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf com.blueboot.BeneficioEducacional.Comprobacion.view.Comprobacion
         */
        //  onAfterRendering: function() {
        //
        //  },

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf com.blueboot.BeneficioEducacional.Comprobacion.view.Comprobacion
         */
        //  onExit: function() {
        //
        //  }

        /**
         * -------------- EVENTOS --------------
         */
        handleAcceptBeneficiario: function(oEvent) {
            var oModel = this.getModel(),
                sDependienteId = oModel.getProperty("/Dependiente"),
                aDependientes = oModel.getProperty("/Dependientes"),
                oDependiente = aDependientes.filter(function(d){
                    return d.id ==  sDependienteId})[0],
                aBeneficios = oModel.getProperty("/Beneficios"),
                sBeneficioId = oModel.getProperty("/BeneficioKey"),
                oBeneficio = aBeneficios.filter(function(b){
                    return b.key ==  sBeneficioId})[0];

            // Mock data - Conectar y quitar
            oBeneficio.tipoDesc = oBeneficio.nombre;
            oBeneficio.periodo = "2019";
            oBeneficio.instituto = "Colegio São Bento";
            oBeneficio.documento = "33.439.092/0004.02";
            oBeneficio.estado = "Rio de Janeiro";
            oBeneficio.serie = "Fundamental 1";
            oBeneficio.inicio = new Date(2019, 1, 0);
            oBeneficio.fin = new Date(2019, 12, 31);
            oBeneficio.dependiente = oDependiente.nombre;
            oModel.setProperty("/Beneficio", oBeneficio);
            this._dialogBeneficiario.close();
        },

        handleSelectBeneficiario: function(oEvent) {
            this._dialogBeneficiario.open();
        },

        handleChangeDependiente: function(oEvent) {
            var oModel = this.getModel(),
            aBeneficios = oModel.getProperty("/Beneficios"),
            sDependiente = oModel.getProperty("/Dependiente");

            // TODO FEDE
            
            oModel.setProperty("/BeneficiosActuales", aBeneficios.filter(function(filtro){
                return filtro.id ==  sDependiente})
            );
                },

        onMessagePopoverPress: function(oEvent) {
            //Sacado de Sample de SAPUI5
            // create popover lazily (singleton)
            if (!this._oMessagePopover) {
                this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(), "com.blueboot.BeneficioEducacional.Comprobacion.view.MessagePopover", this);
                this.getView().addDependent(this._oMessagePopover);
            }
            this._oMessagePopover.openBy(oEvent.getSource());
        },

        onCalendarioChange: function(oEvent) {
            var oModel = this.getModel(),
                oBeneficio = oModel.getProperty("/Beneficio"),
                oDateRange = oEvent.getSource().getSelectedDates()[0];
            oBeneficio.inicioPeriodo = oDateRange.getStartDate();
            oBeneficio.finPeriodo = oDateRange.getEndDate()? new Date(oDateRange.getEndDate().getFullYear(), oDateRange.getEndDate().getMonth() + 1, 0): null;
            oModel.setProperty("/Beneficio", oBeneficio);

            this.validarPaso3();

            if (oBeneficio.inicioPeriodo && oBeneficio.finPeriodo) {
                var aMeses = [],
                    iAnio = oBeneficio.periodo.split(".")[0];
                for (var i = oBeneficio.inicioPeriodo.getMonth(); i <= oBeneficio.finPeriodo.getMonth(); i++) {
                    aMeses.push({
                        mes: (i + 1).toString() + " | " + iAnio.toString(),
                        tipo: "Mensalidade",
                        valor: 2100,
                        pago: 0
                    });
                }
                oModel.setProperty("/Meses", aMeses);
            }
        },

        /**
         * -------------- FIN EVENTOS --------------
         */

        _setPeriodo: function(iAnio) {
            var oModel = this.getModel(),
                oBeneficio = oModel.getProperty("/Beneficio"),
                oCalendario = this.byId("calendario");

            //oCalendario.setMaxDate(oBeneficio.fin);
            //oCalendario.setMinDate(oBeneficio.inicio);
            oCalendario.setStartDate(oBeneficio.inicio);
            // TODO: Calcular dinamicamente
            oCalendario.setMonths(12);
        },

        _removeMessageFromTarget: function (sTarget) {
            this._messageManager.getMessageModel().getData().forEach(function(oMessage){
                if (oMessage.target === sTarget) {
                    this._messageManager.removeMessages(oMessage);
                }
            }.bind(this));
        },

        /**
         * -------------- VALIDACIONES --------------
         */

        validarPaso2: function(oEvent) {
            var oModel = this.getModel(),
                oBeneficio = oModel.getProperty("/Beneficio"),
                sTarget = oEvent.getSource().getBindingContext().getPath() + "/" + oEvent.getSource().getBindingPath("value");

            this._removeMessageFromTarget(sTarget);
            if (!oBeneficio.contrato) {
                this._wizard.invalidateStep(this.byId("paso2"));
                oEvent.getSource().setValueState(ValueState.Error);

                this._messageManager.addMessages(
                    new Message({
                        message: "Deve ler e concordar com os termos",
                        type: ValueState.Error,
                        additionalText: "Termo de compromisso e responsabilidade",
                        target: sTarget,
                        processor: oModel
                    })
                );
            } else {
                this._wizard.validateStep(this.byId("paso2"));
                oEvent.getSource().setValueState(ValueState.None);
                this._setPeriodo();
            }
        },

        validarPaso3: function(oEvent) {
            var oModel = this.getModel(),
                oBeneficio = oModel.getProperty("/Beneficio"),
                oCalendario = this.byId("calendario"),
                oDateRange = oCalendario.getSelectedDates()[0],
                bCalendarioValido = oDateRange && oDateRange.getStartDate() && oDateRange.getEndDate();
            if (!bCalendarioValido) {
                this._wizard.invalidateStep(this.byId("paso3"));
                oModel.setProperty("/Completo", false);
            } else {
                this._wizard.validateStep(this.byId("paso3"));
                oModel.setProperty("/Completo", true);
            }
        },

        validarPaso4: function (oEvent) {
            var oModel = this.getModel(),
                oBeneficio = oModel.getProperty("/Beneficio"),
                oCalendario = this.byId("calendario"),
                oDateRange = oCalendario.getSelectedDates()[0],
                bCalendarioValido = oDateRange && oDateRange.getStartDate() && oDateRange.getEndDate(),
                aMeses = oModel.getProperty("/Meses"),
                bValorValido;
            // No hay validacion por el momento   
            /*for (var i in aMeses1) {
                bMensualidadesValido &= aMeses1[i].valor > 0;
            }
            for (var i in aMeses2) {
                bMensualidadesValido &= aMeses2[i].valor > 0;
            }

            if (!bCalendarioValido || !bValorValido || !bMensualidadesValido) {
                this._wizard.invalidateStep(this.byId("paso5"));
                this.getModel().setProperty("/Completo", false);
            } else {
                this._wizard.validateStep(this.byId("paso5"));
                this.getModel().setProperty("/Completo", true);
            }*/
        }

        /**
         * -------------- FIN VALIDACIONES --------------
         */

    });

});