/*global QUnit*/

sap.ui.define([
	"nba/controller/Equipos.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Equipos Controller");

	QUnit.test("I should test the Equipos controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
