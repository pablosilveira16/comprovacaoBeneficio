sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    return Controller.extend("com.blueboot.BeneficioEducacional.Comprobacion.controller.BaseController", {
        /**
         * Convenience method for accessing the router in every controller of the application.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function() {
            return this.getOwnerComponent().getRouter();
        },

        /**
         * Convenience method for getting the view model by name in every controller of the application.
         * @public
         * @param {string} sName the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function(sName) {
            return this.getOwnerComponent().getModel(sName);
        },

        /**
         * Convenience method for setting the view model in every controller of the application.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function(oModel, sName) {
            return this.getOwnerComponent().setModel(oModel, sName);
        },

        /**
         * Convenience method for getting the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Event handler for navigating back.
         * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the master route.
         * @public
         */
        onNavBack: function() {
            var sPreviousHash = History.getInstance().getPreviousHash(),
                oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

            if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
                history.go(-1);
            } else {
                this.getRouter().navTo("master", {}, true);
            }
        },

        _initLocalModel: function() {
            this._mockData();

            var oModel = this.getModel();
            oModel.setProperty("/TiposBeneficio", [
                { id: "1", desc: "Acompanhante" }, 
                { id: "2", desc: "Creche integral" }, 
                { id: "3", desc: "Creche" },
                { id: "4", desc: "Pré-escola" },
                { id: "5", desc: "Fundamental" },
                { id: "6", desc: "Médio" },
                { id: "7", desc: "Universitário" }
            ]);

            oModel.setProperty("/Estados", [
                { id: "AC", nombre: "Acre" }, 
                { id: "AL", nombre: "Alagoas" }, 
                { id: "AP", nombre: "Amapá" },
                { id: "AM", nombre: "Amazonas" },
                { id: "BA", nombre: "Bahía" },
                { id: "CE", nombre: "Ceará" },
                { id: "DF", nombre: "Distrito Federal" },
                { id: "ES", nombre: "Espírito Santo" },
                { id: "GO", nombre: "Goiás" },
                { id: "MA", nombre: "Maranhão" },
                { id: "MT", nombre: "Mato Grosso" },
                { id: "MS", nombre: "Mato Grosso do Sul" },
                { id: "MG", nombre: "Minas Gerais" },
                { id: "PA", nombre: "Pará" },
                { id: "PB", nombre: "Paraíba" },
                { id: "PR", nombre: "Paraná" },
                { id: "PE", nombre: "Pernambuco" },
                { id: "PI", nombre: "Piauí" },
                { id: "RJ", nombre: "Río de Janeiro" },
                { id: "RN", nombre: "Río Grande do Norte" },
                { id: "RS", nombre: "Río Grande do Sur" },
                { id: "RO", nombre: "Rondonia" },
                { id: "RR", nombre: "Roraima" },
                { id: "SC", nombre: "Santa Catarina" },
                { id: "SP", nombre: "São Paulo" },
                { id: "SE", nombre: "Sergipe" },
                { id: "TO", nombre: "Tocantins" }
            ]);

            oModel.setProperty("/TiposDoc", [
            	{ id: "CPF", nombre: "CPF" },
            	{ id: "CNPJ", nombre: "CNPJ" }
            ]);

            oModel.setProperty("/Series5", [
            	{ id: "1", desc: "Fundamental 1" },
            	{ id: "2", desc: "Fundamental 2" },
            	{ id: "3", desc: "Fundamental 3" },
            	{ id: "4", desc: "Fundamental 4" },
            	{ id: "5", desc: "Fundamental 5" },
            	{ id: "6", desc: "Fundamental 6" },
            	{ id: "7", desc: "Fundamental 7" },
            	{ id: "8", desc: "Fundamental 8" },
            	{ id: "9", desc: "Fundamental 9" }
            ]);

            oModel.setProperty("/Series6", [
            	{ id: "1", desc: "Médio 1" },
            	{ id: "2", desc: "Médio 2" },
            	{ id: "3", desc: "Médio 3" },
            	{ id: "T", desc: "Médio Técnico" }
            ]);

            oModel.setProperty("/Completo", false);
        },

        _mockData: function() {
            var oModel = this.getModel();
            oModel.setProperty("/Dependientes", [
                { id: "julia", nombre: "Julia Silveira" },
                { id: "juan", nombre: "Juan Silveira" },
                { id: "santiago", nombre: "Santiago Silveira" } 
            ]);

            oModel.setProperty("/Beneficios", [
                { id: "juan", nombre: "Pré-escola", tipo: "4", key: "juan-4" }, 
                { id: "juan", nombre: "Acompanhante", tipo: "1", key: "juan-1" },
                { id: "julia", nombre: "Creche", tipo: "3", key: "julia-3" }, 
                { id: "julia", nombre: "Fundamental", tipo: "5", key: "julia-5", publica: true },
                { id: "julia", nombre: "Universitário", tipo: "7", key: "julia-7", publica: false },
                { id: "santiago", nombre: "Médio", tipo: "6", key: "santiago-6", publica: false },
                { id: "santiago", nombre: "Universitário", key: "santiago-7", tipo: "7", publica: true }
            ]);
        }
    });
});