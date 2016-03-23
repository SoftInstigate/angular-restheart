(function () {
    'use strict';

    angular.module('restheart', [
        'LocalStorageModule',
        'base64',
        'restangular',
        'ui.router'
    ]).provider('restheart', restheart);

    function restheart() {

        this.setBaseUrl = function (f) {
            this._baseUrl = f;
        };

        this.setLogicBaseUrl = function (f) {
            this._logicBaseUrl = f;
        };
        
        this.getBaseUrl = function() {
            return this._baseUrl;
        };
        
        this.getLogicBaseUrl = function() {
            return this._logicBaseUrl;
        };

        this.onForbidden = function (f) {
            this.onForbidden = f;
        };

        this.onTokenExpired = function (f) {
            this.onTokenExpired = f;
        };

        this.onUnauthenticated = function (f) {
            this.onUnauthenticated = f;
        };

        this.onNetworkError = function (f) {
            this.onNetworkError = f;
        };

        this.$get = function () {
            return this;
        };
    };
    
})();