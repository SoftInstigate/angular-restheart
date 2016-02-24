(function () {
    'use strict';

    angular.module('restheart', [
        'LocalStorageModule',
        'base64',
        'restangular'
    ])


        .provider('restheart', function () {

            this.setBaseUrl = function (f) {
                this.baseUrl = f;
            };

            this.setLogicBaseUrl = function (f) {
                this.logicBaseUrl = f;
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

            this.$get = function () {
                return this;
            };

        } )
})();